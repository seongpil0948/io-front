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
const tableRef = ref<any>(null);
const tablePageSize = ref(5);
const keyField = "shopProdId";
const { columns, mapper, checkedKeys } = useTable<ShopReqOrderJoined>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField: keyField,
  onCheckAll: (to) => {
    if (tableRef.value) {
      const idxes = (tableRef.value.paginatedData as any[]).map((x) => x.index);
      checkedKeys.value = to
        ? orderJoined.value
            .filter((o, idx) => idxes.includes(idx))
            .map((p) => p[keyField])
        : [];
    }
  },
});

watchEffect(() => {
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.title = "주문/미송";
      x.render = (row: ShopReqOrderJoined) =>
        h(ShopOrderCnt, {
          row,
          onSubmitPost: () => {
            !row.allowPending
              ? msg.warning(
                  "해당상품은 미송을 잡을 수 없는 상품입니다.",
                  makeMsgOpt()
                )
              : msg.info(`주문개수가 업데이트되었습니다.`, makeMsgOpt());
          },
        });
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
async function deleteAll() {
  return deleteOrders(orderInfo.value)
    .then(() => msg.success("삭제 성공.", makeMsgOpt()))
    .catch(() => msg.success("삭제 실패.", makeMsgOpt()));
}
async function orderChecked() {
  const targets = orderJoined.value.filter((x) =>
    checkedKeys.value.includes(x[keyField]!)
  );
  return Promise.all(targets.map((t) => orderVendorProd(t)))
    .then(() => msg.success("주문 성공.", makeMsgOpt()))
    .catch((err) => {
      msg.success(`주문 실패. ${err}`, makeMsgOpt());
      log.error(user.userInfo.userId, `주문 실패. ${err}`);
    });
}
async function orderAll() {
  return Promise.all(orderJoined.value.map((t) => orderVendorProd(t)))
    .then(() => msg.success("주문 성공.", makeMsgOpt()))
    .catch((err) => {
      msg.success(`주문 실패. ${err}`, makeMsgOpt());
      log.error(user.userInfo.userId, `주문 실패. ${err}`);
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
    writeOrderBatch(user.userInfo.userId, newOrders).then(() => {
      newOrders.forEach((ord) => {
        existOrderIds.value.add(ord.orderId);
      });
    });
  }
);
function downXlsx() {
  const a = document.createElement("a");
  // a.href = url
  a.href = "/example/sample.xlsx";
  a.download = "sample.xlsx";
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
      <n-space justify="start" style="margin-left: 5px" :wrap="false">
        <n-button size="small" type="primary" @click="orderChecked">
          선택주문
        </n-button>
        <n-button size="small" type="primary" @click="orderAll">
          전체주문
        </n-button>
        <n-button size="small" type="primary" @click="deleteChecked">
          선택삭제
        </n-button>
        <n-button size="small" type="primary" @click="deleteAll">
          전체삭제
        </n-button>
      </n-space>
    </template>

    <n-data-table
      ref="tableRef"
      v-if="orderJoined && orderJoined.length > 0"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="columns"
      :data="orderJoined"
      :pagination="{
        pageSize: tablePageSize,
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
