<script setup lang="ts">
import { ORDER_STATE, usePendingOrderCols } from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";

import { onBeforeMount } from "vue";

const auth = useAuthStore();
const shopOrderStore = useShopOrderStore();
const { pendingOrderCols } = usePendingOrderCols();
const inStates = ["BEFORE_READY"] as ORDER_STATE[];
onBeforeMount(() => shopOrderStore.init(auth.currUser.userInfo.userId));
const filteredOrders = shopOrderStore.getFilteredOrder(inStates);
const orders = shopOrderStore.getOrders(inStates);
</script>
<template>
  <n-card v-if="orders && orders.length > 0">
    <n-space vertical align="center">
      <n-h2>미송 주문 조회</n-h2>
      <n-data-table
        ref="tableRef"
        :table-layout="'fixed'"
        :scroll-x="800"
        :columns="pendingOrderCols"
        :data="filteredOrders"
        :pagination="{
          'show-size-picker': true,
          'page-sizes': [5, 10, 25, 50, 100],
        }"
        :bordered="false"
      />
    </n-space>
  </n-card>
  <n-result
    v-else
    style="margin-top: 30%"
    status="error"
    title="데이터가 없습니다"
  />
</template>
