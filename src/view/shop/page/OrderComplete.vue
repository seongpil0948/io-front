<script setup lang="ts">
import { ORDER_STATE, ProdOrderCombined, useOrderTable } from "@/composable";
import { useShopOrderStore } from "@/store";

// const msg = useMessage();
// const u = auth.currUser;
const inStates: ORDER_STATE[] = ["BEFORE_PAYMENT"];
const shopOrderStore = useShopOrderStore();

const filteredOrders = shopOrderStore.getFilteredOrder(inStates);
const orders = shopOrderStore.getOrders(inStates);
const garmentOrdersByVendor =
  shopOrderStore.getGarmentOrdersByVendor(filteredOrders);
const {
  tableRef,
  byVendorCol,
  // byVendorKeys,
  selectedData, // selected
  // checkedDetailKeys, // selected Item
  onCheckDetailRow,
  tableCol,
} = useOrderTable({
  garmentOrders: filteredOrders,
  orders,
  updateOrderCnt: true,
  useChecker: false,
});
// const filtered = computed(() =>
//   garmentOrdersByVendor.value.filter((x) =>
//     byVendorKeys.value.includes(x.vendorId)
//   )
// );
</script>
<template>
  <n-space vertical justify="space-around">
    <n-data-table
      v-if="garmentOrdersByVendor.length > 0"
      ref="tableRef"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="byVendorCol"
      :data="garmentOrdersByVendor"
      :pagination="{
        'show-size-picker': true,
        'page-sizes': [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
    <n-result
      v-else
      style="margin-top: 30%"
      status="error"
      title="주문 완료 및 결제 대상 데이터가 없습니다"
    />
    <n-card
      v-if="selectedData"
      :bordered="false"
      :title="selectedData.vendorName"
    >
      <n-data-table
        :bordered="false"
        :columns="tableCol"
        :data="selectedData.items"
        :rowKey="(row: ProdOrderCombined) => row.id"
        @update:checked-row-keys="onCheckDetailRow"
      />
    </n-card>
  </n-space>
</template>

<style scoped></style>
