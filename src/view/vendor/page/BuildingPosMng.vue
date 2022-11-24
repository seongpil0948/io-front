<script setup lang="ts">
import { useSearch, VendorProdCrt } from "@/composable/";
import { useVendorsStore } from "@/store";
import { NButton } from "naive-ui";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const store = useVendorsStore();
const { vendorProds } = storeToRefs(store);
const { search, searchedData, searchInputVal } = useSearch({
  data: vendorProds,
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return v === null
      ? true
      : x.size.includes(v) ||
          x.color.includes(v) ||
          x.vendorProdName.includes(v);
  },
});
const selectedData = ref<VendorProdCrt[]>([]);
function onClickProd(prod: VendorProdCrt) {
  selectedData.value.push(prod);
}
</script>

<template>
  <n-space justify="space-around">
    <n-card class="container">
      <n-h2 class="center-txt">주문목록</n-h2>
      {{ selectedData.length }}
      총계: {{ selectedData.reduce((acc, curr) => acc + curr.vendorPrice, 0) }}
      <template #footer>
        <n-space justify="end" align="center">
          <!-- <vendor-complete-pay-prod-button
            :target-ord-db-ids="[...targetOrdDbIds]"
            :target-ord-item-ids="[...targetIds]"
            :target-shop-ids="targetShopIds"
            button-text="결제완료"
            button-class="under-bar"
            :is-text="true"
          /> -->
        </n-space>
      </template>
    </n-card>
    <n-card class="container" style="width: 70vw min-width: 400px;">
      <template #header> 상품목록 </template>
      <template #header-extra>
        <n-space>
          <n-input v-model:value="searchInputVal" placeholder="상품검색" />
          <n-button @click="search"> 검색 </n-button>
        </n-space>
      </template>
      <n-grid
        x-gap="12"
        y-gap="12"
        cols="1 s:2 m:2 l:3 xl:4"
        responsive="screen"
      >
        <n-gi v-for="(prod, i) in searchedData" :key="i">
          <n-card
            style="margin: auto; width: 200px; cursor: pointer"
            @click="onClickProd(prod)"
          >
            <n-space vertical>
              <n-text>{{ prod.vendorProdName }}</n-text>
              <n-text type="info">{{ prod.size }} / {{ prod.color }}</n-text>
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
  </n-space>
</template>

<style scoped>
.container {
  min-width: 400px;
  height: 60vw;
  overflow: auto;
}
</style>
