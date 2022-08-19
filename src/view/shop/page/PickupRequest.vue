<script setup lang="ts">
import { useOrderTable, ORDER_STATE } from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { onBeforeMount } from "vue";

const auth = useAuthStore();
const inStates: ORDER_STATE[] = ["BEFORE_PICKUP"];
const shopOrderStore = useShopOrderStore();
onBeforeMount(() => shopOrderStore.init(auth.currUser.userInfo.userId));
const filteredOrders = shopOrderStore.getFilteredOrder(inStates);
const orders = shopOrderStore.getOrders(inStates);
const garmentOrdersByVendor =
  shopOrderStore.getGarmentOrdersByVendor(filteredOrders);
const { tableRef, byVendorCol } = useOrderTable({
  garmentOrders: filteredOrders,
  orders,
  updateOrderCnt: true,
});
</script>

<template>
  <n-space vertical align="center">
    <n-card title="미출고/출고 가능목록">
      <n-data-table
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
    </n-card>
  </n-space>
</template>
