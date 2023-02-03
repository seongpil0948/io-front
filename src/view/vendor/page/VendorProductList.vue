<script setup lang="ts">
import { useSearch, useVendorProdCols } from "@/composable/";
import { useVendorOrderStore } from "@/store/vendorOrder";
import { NButton } from "naive-ui";

const store = useVendorOrderStore();
const orders = store.getOrders([]);
const vendorOrderGarments = store.getVendorOrderGarments(orders);
const { columns, showProdEdit, prodEditTarget, onShowProdEdit } =
  useVendorProdCols(true, false);

const { search, searchedData, searchInputVal } = useSearch({
  data: vendorOrderGarments,
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return v === null
      ? true
      : x.size.includes(v) ||
          x.color.includes(v) ||
          x.vendorProdName.includes(v);
  },
});
</script>
<template>
  <n-card style="width: 100%">
    <template #header> 상품목록 </template>
    <template #header-extra>
      <n-space>
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search"> 검색 </n-button>
      </n-space>
    </template>

    <n-data-table
      :scroll-x="1200"
      :columns="columns"
      :data="searchedData"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <n-modal
    v-model:show="showProdEdit"
    preset="card"
    style="width: 70%"
    title="상품 정보 수정"
  >
    <vendor-prod-edit-form
      v-if="showProdEdit && prodEditTarget"
      :prod="prodEditTarget"
      @on-submit-prod="onShowProdEdit(null)"
    />
  </n-modal>
</template>
