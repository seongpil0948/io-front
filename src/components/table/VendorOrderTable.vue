<script setup lang="ts">
import {
  useReadVendorOrderInfo,
  useTable,
  getScreenSize,
  ScreenSize,
  orderStateKo,
  VendorProd,
} from "@/composables";
import { updateOrderBatch, vendorProdsModify } from "@/plugins/firebase";
import { useAuthStore } from "@/stores/auth";
import { IoColOpt, ORDER_STATE, VendorUserOrderProd } from "@/types";
import { toRefs, watchEffect } from "vue";
import { useLogger } from "vue-logger-plugin";

const auth = useAuthStore();
const user = auth.currUser;
const log = useLogger();
interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
  showState?: boolean;
}
const props = defineProps<Props>();
const { inStates, notStates } = toRefs(props);
const { orderProds } = useReadVendorOrderInfo({
  vendorId: user.userInfo.userId,
  inStates: inStates?.value,
  notStates: notStates?.value,
  orderExist: false,
});

const cols = [
  "userName",
  "vendorProdName",
  "color",
  "size",
  "orderCnt",
  "pendingCnt",
  "stockCnt",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});
const keyField = "shopProdId";
const { columns, checkedKeys } = useTable<VendorUserOrderProd>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField,
  onCheckAll: function (to) {
    checkedKeys.value = to ? orderProds.value.map((p) => p[keyField]) : [];
  },
});
watchEffect(() => {
  if (props.showState && !columns.value.some((x) => x.key === "state")) {
    columns.value.splice(2, 0, {
      key: "state",
      title: () => "주문상태",
      render: (row) => orderStateKo(row.orderState),
    });
  }
});

const getTargets = () =>
  orderProds.value.filter((x) => checkedKeys.value.includes(x.shopProdId));
function getOrderByShop(targets: VendorUserOrderProd[]) {
  const orderDbIdByShops: { [shopId: string]: string[] } = {};
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    if (!orderDbIdByShops[target.shopId]) {
      orderDbIdByShops[target.shopId] = [target.dbId];
    } else {
      orderDbIdByShops[target.shopId].push(target.dbId);
    }
  }
  return orderDbIdByShops;
}
async function approveChecked() {
  const targets = getTargets();
  await updateOrderBatch({
    orderDbIdByShops: getOrderByShop(targets),
    orderState: ORDER_STATE.BEFORE_PAYMENT,
  });
  targets.forEach((t) => {
    t.stockCnt -= t.orderCnt - t.pendingCnt;
    log.debug("to stockCnt: ", t.stockCnt);
    if (t.stockCnt < 0) {
      log.error(null, "상품재고량은 0 이하가 될 수 없습니다.");
    }
  });
  await vendorProdsModify(targets.map((t) => VendorProd.fromJson(t)!));
}
async function rejectChecked() {
  const targets = getTargets();
  await updateOrderBatch({
    orderDbIdByShops: getOrderByShop(targets),
    orderState: ORDER_STATE.BEFORE_ORDER,
  });
}
async function depositedChecked() {
  const targets = getTargets();
  await updateOrderBatch({
    orderDbIdByShops: getOrderByShop(targets),
    orderState: ORDER_STATE.BEFORE_SHIP,
  });
}
async function cancelChecked() {
  const targets = getTargets();
  await rejectChecked();
  targets.forEach((t) => {
    t.stockCnt += t.orderCnt - t.pendingCnt;
    log.debug("to stockCnt: ", t.stockCnt);
  });
  await vendorProdsModify(targets.map((t) => VendorProd.fromJson(t)!));
}
</script>
<template>
  <n-card>
    <template #header>
      <div></div>
    </template>
    <template #header-extra>
      <n-space
        justify="start"
        v-if="inStates && inStates.includes(ORDER_STATE.BEFORE_APPROVE)"
      >
        <n-button size="small" type="primary" @click="approveChecked">
          선택주문승인
        </n-button>
        <n-button size="small" type="primary" @click="rejectChecked">
          선택주문거부
        </n-button>
      </n-space>
      <n-space
        justify="start"
        v-if="
          notStates &&
          notStates.includes(ORDER_STATE.BEFORE_APPROVE) &&
          notStates.includes(ORDER_STATE.BEFORE_ORDER)
        "
      >
        <n-button size="small" type="primary" @click="depositedChecked">
          결제완료처리
        </n-button>
        <n-button size="small" type="primary" @click="cancelChecked">
          미결제 취소
        </n-button>
      </n-space>
    </template>
    <n-data-table
      :table-layout="getScreenSize() === ScreenSize.L ? 'fixed' : 'auto'"
      :scroll-x="1200"
      :columns="columns"
      :data="orderProds"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
      style="min-height: 50vh"
    />
  </n-card>
</template>
