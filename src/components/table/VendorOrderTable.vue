<script setup lang="ts">
import { ShopReqOrder, useReadVendorOrderInfo, useTable } from "@/composables";
import { useAuthStore } from "@/stores/auth";
import { IoColOpt, ORDER_STATE, VendorUserProd } from "@/types";
import { toRefs, watchEffect } from "vue";

const auth = useAuthStore();
const user = auth.currUser;

interface Props {
  orderStates: ORDER_STATE[];
}
const props = defineProps<Props>();
const { orderStates } = toRefs(props);
const { orderProds } = useReadVendorOrderInfo(
  user.userInfo.userId,
  orderStates.value
);

const cols = [
  "userName",
  "vendorProdName",
  "color",
  "size",
  "stockCnt",
  "orderCnt",
  "pendingCnt",
  "amount",
  "unPaidAmount",
  "amountPaid",
].map((c) => {
  return { key: c } as IoColOpt;
});
const { columns, rendorTableBtn } = useTable<VendorUserProd>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField: "vendorProdId",
});
watchEffect(() => {
  columns.value.push({
    key: "oooorder",

    title: () =>
      rendorTableBtn(() => {
        console.log("CLICK TITLE");
      }, "선택주문 거부"),
    render: (row) =>
      rendorTableBtn(async () => {
        const order = ShopReqOrder.fromJson(row);
        if (!order) return;
        else if (order.orderState === ORDER_STATE.BEFORE_APPROVE) {
          order.orderState = ORDER_STATE.BEFORE_PAYMENT;
          await order.update();
        }
      }, "승인 완료"),
  });
});
</script>
<template>
  <n-data-table
    :table-layout="'fixed'"
    scroll-x="1200"
    :columns="columns"
    :data="orderProds"
    :pagination="{
      pageSize: 10,
    }"
    :bordered="false"
  />
</template>
