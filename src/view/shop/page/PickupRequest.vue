<script setup lang="ts">
import { useReadShopOrderGInfo, useOrderTable } from "@/composable";
import { useAuthStore } from "@/store";

const auth = useAuthStore();

const { orders, garmentOrders, garmentOrdersByVendor } = useReadShopOrderGInfo(
  auth.currUser.userInfo.userId,
  ["BEFORE_PICKUP"]
);
const { tableRef, byVendorCol } = useOrderTable({
  garmentOrders,
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
