<script lang="ts" setup>
import { h, ref, watchEffect } from "vue";
import {
  getOrderCnt,
  getPendingCnt,
  makeMsgOpt,
  useParseOrderInfo,
  useShopReadOrderInfo,
  useTable,
} from "@/composables";
import { useAuthStore } from "@/stores";
import { IoColOpt, ORDER_STATE, ShopReqOrderJoined } from "@/types";
import { NGradientText, useMessage } from "naive-ui";
import ShopOrderCnt from "../input/ShopOrderCnt.vue";
import {
  writeOrderBatch,
  orderVendorProd,
  deleteOrders,
} from "@/plugins/firebase";
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
async function deleteChecked() {
  const targets = orderInfo.value.filter((x) =>
    checkedKeys.value.includes(x[keyField]!)
  );
  return deleteOrders(targets)
    .then(() => msg.success("삭제 성공.", makeMsgOpt()))
    .catch(() => msg.success("삭제 실패.", makeMsgOpt()));
}
async function orderChecked() {
  const targets = orderJoined.value.filter((x) =>
    checkedKeys.value.includes(x[keyField]!)
  );
  return Promise.all(targets.map((t) => orderVendorProd(t)))
    .then(() => msg.success("주문 성공.", makeMsgOpt()))
    .catch(() => msg.success("주문 실패.", makeMsgOpt()));
}
async function orderAll() {
  const orders = [];
  for (let i = 0; i < orderJoined.value.length; i++) {
    orders.push(orderVendorProd(orderJoined.value[i]));
  }
  return Promise.all(orders)
    .then(() => msg.success("주문 성공", makeMsgOpt()))
    .catch(() => msg.success("주문 실패.", makeMsgOpt()));
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

const { orderJoined, existOrderIds, orderInfo } = useShopReadOrderInfo({
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
          선택주문
        </n-button>
        <n-button size="small" type="primary" @click="orderAll">
          전체주문
        </n-button>
        <n-button size="small" type="primary" @click="deleteChecked">
          선택삭제
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
        pageSize: 5,
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
