<script setup lang="ts">
import CancelButton from "@/component/button/CancelButton.vue";
import {
  ORDER_STATE,
  OrderItemCombined,
  useOrderTable,
  OrderCancel,
} from "@/composable";
import { useShopOrderStore } from "@/store";
import { computed, h } from "vue";

// const u = auth.currUser();
const inStates: ORDER_STATE[] = ["BEFORE_PAYMENT", "BEFORE_APPROVE"];
const shopOrderStore = useShopOrderStore();

const filteredOrders = shopOrderStore.getFilteredOrder(inStates);
const orders = shopOrderStore.getOrders(inStates);
const ioOrdersByVendor =
  shopOrderStore.getGarmentOrdersByVendor(filteredOrders);
const {
  tableRef,
  byVendorCol,
  // byVendorKeys,
  selectedData, // selected
  tableCol,
} = useOrderTable({
  ioOrders: filteredOrders,
  orders,
  updateOrderCnt: true,
  useChecker: true,
  useState: true,
  useAllAmount: true,
});

function refreshSelected() {
  // selectedData.value =
  //   ioOrdersByVendor.value.find(
  //     (x) => x.vendorId === selectedData.value?.vendorId
  //   ) ?? null;
  selectedData.value = null;
}
const columns = computed(() => [
  ...tableCol.value,
  {
    key: "cancel",
    title: "취소접수",
    render: (orderItem: OrderItemCombined) =>
      h(
        CancelButton,
        {
          orderItem,

          onCancelDone: async (val: OrderCancel) => {
            console.log("cancel claim: ", val);
            refreshSelected();
          },
        },
        { default: () => "취소요청" }
      ),
  },
]);
</script>
<template>
  <n-card>
    <n-space vertical justify="space-around">
      <n-space justify="center">
        <n-h2> 승인 완료된 주문 </n-h2>
      </n-space>
      <n-data-table
        v-if="ioOrdersByVendor.length > 0"
        ref="tableRef"
        :table-layout="'fixed'"
        :scroll-x="800"
        :columns="byVendorCol"
        :data="ioOrdersByVendor"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
      />
      <n-result
        v-else
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
          :columns="columns"
          :data="selectedData.items"
          :row-key="(row: OrderItemCombined) => row.id"
        />
      </n-card>
    </n-space>
  </n-card>
</template>

<style scoped></style>
