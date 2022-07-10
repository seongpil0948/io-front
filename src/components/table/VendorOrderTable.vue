<script setup lang="ts">
import {
  ShopReqOrder,
  useReadVendorOrderInfo,
  useTable,
  getScreenSize,
  ScreenSize,
  orderStateKo,
} from "@/composables";
import { useAuthStore } from "@/stores/auth";
import {
  IoColOpt,
  ORDER_STATE,
  VendorUserOrderProd,
  VendorUserProd,
} from "@/types";
import { toRefs, watchEffect } from "vue";

const auth = useAuthStore();
const user = auth.currUser;

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
  "stockCnt",
  "orderCnt",
  "pendingCnt",
  "amount",
  "unPaidAmount",
  "amountPaid",
].map((c) => {
  return { key: c } as IoColOpt;
});
const { columns, rendorTableBtn } = useTable<VendorUserOrderProd>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField: "vendorProdId",
});
watchEffect(() => {
  if (props.showState && !columns.value.some((x) => x.key === "state")) {
    columns.value.splice(2, 0, {
      key: "state",
      title: () => "주문상태",
      render: (row) => orderStateKo(row.orderState),
    });
  }
  if (
    inStates &&
    inStates.value &&
    inStates.value.includes(ORDER_STATE.BEFORE_APPROVE) &&
    !columns.value.some((x) => x.key === "oooorder")
  ) {
    columns.value.push({
      key: "oooorder",
      title: () => rendorTableBtn(() => null, "선택주문 거부"),
      render: (row) =>
        row.orderState === ORDER_STATE.BEFORE_APPROVE
          ? rendorTableBtn(async () => {
              const order = ShopReqOrder.fromJson(row);
              if (!order) return;
              else if (order.orderState === ORDER_STATE.BEFORE_APPROVE) {
                order.orderState = ORDER_STATE.BEFORE_PAYMENT;
                await order.update();
              }
            }, "주문승인")
          : rendorTableBtn(() => {
              console.log("dd");
            }, "-"),
    });
  }
});
// FIXME: 샵 오더인포로 해야 소매 이름을 가져올수 있나?
</script>
<template>
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
</template>
