<script setup lang="ts">
import { getPendingCnt, getOrderCnt, useTable } from "@/composables";
import { useAuthStore } from "@/stores";
import { IoColOpt, ORDER_STATE, ShopReqOrderJoined } from "@/types";
import { NGradientText } from "naive-ui";
import { computed, h, ref, watchEffect } from "vue";
import ShopOrderCnt from "@/components/input/ShopOrderCnt.vue";
const targetVendorOrder = ref<null | ShopReqOrderJoined[]>(null);
function onClickOrder(val: ShopReqOrderJoined[]) {
  targetVendorOrder.value = val;
}
const targetOrders = computed(() => {
  const v = targetVendorOrder.value;
  if (!v) return [];
  return targetVendorOrder.value;
});
function rowClassName(row: ShopReqOrderJoined) {
  const pendingCnt = row.allowPending
    ? getPendingCnt(row.stockCnt!, row.orderCnt!)
    : 0;
  const orderAvailCnt = getOrderCnt(row.stockCnt!, row.orderCnt!, pendingCnt);
  const orderNotAvailable = orderAvailCnt < row.orderCnt!;
  return orderNotAvailable || pendingCnt > 0 ? "not-avail-order" : "";
}
const auth = useAuthStore();
const user = auth.currUser;
const cols = [
  "userName",
  "vendorProdName",
  "prodName",
  "color",
  "size",
  "orderCnt",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});
const keyField = "shopProdId";
const { columns, checkedKeys } = useTable<ShopReqOrderJoined>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField: keyField,
  onCheckAll: (to) =>
    (checkedKeys.value =
      to && targetOrders.value
        ? targetOrders.value.map((p) => p[keyField])
        : []),
});

watchEffect(() => {
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
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
</script>
<template>
  <n-space vertical justify="space-around">
    <n-card title="주문완료내역">
      <shop-order-table
        @clickOrder="onClickOrder"
        :inStates="[
          ORDER_STATE.BEFORE_APPROVE,
          ORDER_STATE.BEFORE_PAYMENT,
          ORDER_STATE.PAYMENT_COMPLETE,
        ]"
      />
    </n-card>
    <n-card
      title="주문상세내역"
      v-if="targetOrders && targetOrders.length > 0"
      style="width: 80%"
    >
      <n-data-table
        :table-layout="'fixed'"
        :scroll-x="800"
        :columns="columns"
        :data="targetOrders"
        :pagination="{
          pageSize: 10,
        }"
        :bordered="false"
        :row-class-name="rowClassName"
      />
    </n-card>
  </n-space>
</template>

<style scoped></style>
