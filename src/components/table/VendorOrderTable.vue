<script setup lang="ts">
import { useReadVendorOrderInfo, useTable } from "@/composables";
import { useAuthStore } from "@/stores/auth";
import { IoColOpt, ORDER_STATE, VendorUserProd } from "@/types";
import { NButton } from "naive-ui";
import { h, toRefs } from "vue";

const auth = useAuthStore();
const user = auth.currUser;

interface Props {
  orderStates: ORDER_STATE[];
}
const props = defineProps<Props>();
const { orderStates } = toRefs(props);
const { orderProds } = useReadVendorOrderInfo(user.userId, orderStates.value);

const cols = [
  "userName",
  "vendorProdName",
  "color",
  "size",
  "stockCnt",
  "orderCnt",
  "pendingCnt",
  "unPaidAmount",
  "amountPaid",
].map((c) => {
  return { key: c } as IoColOpt;
});
const { columns } = useTable<VendorUserProd>({
  userId: user.userId,
  colKeys: cols,
  useChecker: true,
  keyField: "vendorProdId",
});
columns.value.push({
  key: "oooorder",
  title: () =>
    h(
      NButton,
      {
        round: true,
        size: "small",
        onClick: () => {
          console.log("CLICK TITLE");
        },
      },
      "선택주문 거부"
    ),
  render: (row) => {
    return h(
      NButton,
      {
        round: true,
        size: "small",
        onClick: () => {
          console.log("CLICK ROW", row);
        },
      },
      "승인 완료"
    );
  },
});
</script>
<template>
  <n-data-table
    v-if="orderProds"
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
