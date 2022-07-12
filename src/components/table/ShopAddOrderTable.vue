<script lang="ts" setup>
import { h, ref, watchEffect } from "vue";
import {
  getOrderCnt,
  getPendingCnt,
  makeMsgOpt,
  orderAble,
  ShopReqOrder,
  useParseOrderInfo,
  useShopReadOrderInfo,
  useTable,
} from "@/composables";
import { useAuthStore } from "@/stores";
import {
  IoColOpt,
  ORDER_STATE,
  ShopReqOrderJoined,
  VendorOperInfo,
} from "@/types";
import { NGradientText, useMessage } from "naive-ui";
import ShopOrderCnt from "../input/ShopOrderCnt.vue";
import { writeOrderBatch } from "@/plugins/firebase";
import { useLogger } from "vue-logger-plugin";

interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
}
const msg = useMessage();
const props = defineProps<Props>();
const auth = useAuthStore();
const user = auth.currUser;
const fileModel = ref<File[]>([]);
const log = useLogger();
// >>>>> COLUMNS >>>>>
const cols = [
  "userName",
  "prodName",
  "orderCnt",
  "allowPending",
  // "stockCnt",
  "color",
  "size",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});
const keyField = "shopProdId";
const { columns, mapper, checkedKeys } = useTable<ShopReqOrderJoined>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField: keyField,
  onCheckAll: (to) =>
    (checkedKeys.value = to ? orderJoined.value.map((p) => p[keyField]) : []),
});

watchEffect(() => {
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.title = "주문/미송";
      x.render = (row: ShopReqOrderJoined) => h(ShopOrderCnt, { row });
    } else if (x.key === "amount") {
      x.render = (row: ShopReqOrderJoined) => row.amount!.toLocaleString();
    } else if (x.key === "allowPending") {
      x.render = (row: ShopReqOrderJoined) =>
        h(
          NGradientText,
          {
            type: row.allowPending ? "info" : "error",
          },
          { default: () => (row.allowPending ? "가능" : "불가능") }
        );
    }
  });
});

async function order(row: ShopReqOrderJoined) {
  const data = ShopReqOrder.fromJson(row);
  if (data && row.stockCnt !== undefined) {
    data.pendingCnt = row.allowPending
      ? getPendingCnt(row.stockCnt, row.orderCnt!)
      : 0;
    data.orderCnt = getOrderCnt(row.stockCnt, row.orderCnt!, data.pendingCnt);
    if (!orderAble(row.stockCnt, data.orderCnt, data.pendingCnt)) {
      msg.error("미송 + 재고의 수량이 주문 수량보다 적습니다.", makeMsgOpt());
      return;
    }
    data.amount = data.orderCnt * row.prodPrice!;
    if ((row.operInfo as VendorOperInfo).autoOrderApprove) {
      data.orderState = ORDER_STATE.BEFORE_PAYMENT;
    } else {
      data.orderState = ORDER_STATE.BEFORE_APPROVE;
      data.waitApprove = true;
    }

    await data.update();
  }
}
async function orderChecked() {
  const targets = orderJoined.value.filter((x) =>
    checkedKeys.value.includes(x[keyField]!)
  );
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    await order(target);
    msg.success("주문 요청에 성공하셨습니다.", makeMsgOpt());
  }
}
async function orderAll() {
  const orders = [];
  for (let i = 0; i < orderJoined.value.length; i++) {
    orders.push(order(orderJoined.value[i]));
  }
  Promise.all(orders).then(() => {
    msg.success("주문 요청에 성공하셨습니다.", makeMsgOpt());
  });
}
function rowClassName(row: ShopReqOrderJoined) {
  const pendingCnt = row.allowPending
    ? getPendingCnt(row.stockCnt!, row.orderCnt!)
    : 0;
  const orderAvailCnt = getOrderCnt(row.stockCnt!, row.orderCnt!, pendingCnt);
  const orderNotAvailable = orderAvailCnt < row.orderCnt!;
  return orderNotAvailable || pendingCnt > 0 ? "not-avail-order" : "";
}
// <<<<< COLUMNS <<<<<

const { orderJoined, existOrderIds } = useShopReadOrderInfo({
  shopId: user.userInfo.userId,
  inStates: props.inStates ?? [],
  notStates: props.notStates ?? [],
});
useParseOrderInfo(
  mapper,
  user.userInfo.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    log.debug("newOrders: ", newOrders);
    await writeOrderBatch(user.userInfo.userId, newOrders);
  }
);
function downXlsx() {
  const a = document.createElement("a");
  // a.href = url
  a.href = "/example/combine-order-example.xlsx";
  a.download = "combine-order-example.xlsx";
  a.click();
  a.remove();
}
</script>
<template>
  <drop-zone-card
    style="width: 80%"
    :listenClick="false"
    v-model:fileModel="fileModel"
  >
    <template #header>
      <n-space justify="start">
        <n-button size="small" type="primary" @click="downXlsx">
          주문취합 엑셀양식 다운
        </n-button>
      </n-space>
    </template>
    <template #header-extra>
      <n-space justify="start">
        <n-button size="small" type="primary" @click="orderChecked">
          선택상품 주문
        </n-button>
        <n-button size="small" type="primary" @click="orderAll">
          전체상품 주문
        </n-button>
      </n-space>
    </template>

    <n-data-table
      v-if="orderJoined && orderJoined.length > 0"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="columns"
      :data="orderJoined"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
      :row-class-name="rowClassName"
    />
  </drop-zone-card>
</template>

<style scoped>
:deep(.not-avail-order td) {
  color: red !important;
}
</style>
