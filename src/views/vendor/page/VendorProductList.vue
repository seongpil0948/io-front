<script setup lang="ts">
import { useAuthStore } from "@/stores";
import type { VendorProdCRT } from "@/types";
import { useTable, useVendor } from "@/composables";
const auth = useAuthStore();

const { prods } = useVendor(auth.currUser.userId);
const rowIdField = "vendorProdId";
const { columns } = useTable<VendorProdCRT>(auth.currUser.userId, [
  { key: "vendorProdName", rowIdField },
  { key: "vendorPrice", rowIdField },
  { key: "size", rowIdField },
  { key: "color", rowIdField },
  { key: "stockCnt", rowIdField },
]);
</script>
<template>
  <n-card>
    <template #header> 상품목록 </template>
    <n-data-table
      :columns="columns"
      :data="prods"
      :pagination="{
        pageSize: 5,
      }"
      :bordered="false"
    />
  </n-card>
</template>
