<script setup lang="ts">
import {
  PART,
  usePaginate,
  useSearch,
  VendorUserGarmentCombined,
} from "@/composable";
import { useVendorsStore } from "@/store";
import { computed, ref, watchEffect } from "vue";
import { getCtgrOpts, partOpts } from "@/util";
const selectedPart = ref<PART | "전체" | null>(null);
const selectedCtgr = ref<string | null>(null);

const showAddModal = ref(false);
const selectedProd = ref<VendorUserGarmentCombined | null>(null);
function onClickProd(prod: VendorUserGarmentCombined) {
  showAddModal.value = true;
  selectedProd.value = prod;
}
watchEffect(() => {
  if (!showAddModal.value) {
    selectedProd.value = null;
  }
});
function validProd(prod: VendorUserGarmentCombined) {
  let valid = true;
  if (selectedPart.value && selectedPart.value !== "전체") {
    valid = prod.part === selectedPart.value;
  } else {
    selectedCtgr.value = null;
  }
  if (selectedCtgr.value && selectedCtgr.value !== "전체") {
    valid = prod.ctgr === selectedCtgr.value;
  }
  return valid;
}
const vendorStore = useVendorsStore();
const { search, searchedData, searchInputVal } = useSearch({
  data: computed(() => Object.values(vendorStore.vendorUserCombinedGarments)),
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return (
      (v === null
        ? true
        : x.fabric.includes(v) ||
          x.description.includes(v) ||
          x.vendorProdName.includes(v)) &&
      (part.value === null ? true : x.part === part.value) &&
      (ctgr.value === null ? true : x.ctgr === ctgr.value)
    );
  },
});

const { totalPage, paginatedData, page } = usePaginate({
  data: searchedData,
});

const part = ref(null);
const ctgr = ref(null);
const ctgrOpts = computed(() =>
  part.value !== null ? getCtgrOpts(part.value) : []
);
</script>
<template>
  <shop-add-prod-card
    v-if="selectedProd"
    v-model:showAddModal="showAddModal"
    :prod="selectedProd"
  />
  <n-space
    vertical
    v-if="searchedData.length > 0"
    style="width: 100%"
    item-style="width: 100%"
  >
    <n-space justify="center">
      <n-input
        v-model:value="searchInputVal"
        placeholder="상품검색 - 오늘도 신상을 잘 찾아보즈아!"
        style="width: 30vw"
      />
      <n-button @click="search">검색</n-button>
      <n-select
        placeholder="파트선택"
        clearable
        v-model:value="part"
        :options="partOpts"
      />
      <n-select
        placeholder="카테고리선택"
        clearable
        v-model:value="ctgr"
        :options="ctgrOpts"
      />
    </n-space>
    <n-space justify="center" style="width: 100%" item-style="width: 100%">
      <!-- <part-ctgr-menu
        v-model:selectedPart="selectedPart"
        v-model:selectedCtgr="selectedCtgr"
      /> -->
      <n-card style="height: 70vh; overflow: auto">
        <!-- prods -->
        <n-grid
          x-gap="12"
          y-gap="12"
          cols="1 s:2 m:3 l:4 xl:5"
          responsive="screen"
        >
          <n-gi v-for="(prod, i) in paginatedData" :key="i">
            <vendor-prod-thum
              style="padding: 5%; margin: auto"
              v-if="validProd(prod)"
              :prod="prod"
              :width="250"
              @onClickProd="onClickProd"
            />
          </n-gi>
        </n-grid>
      </n-card>
    </n-space>
    <n-pagination
      style="justify-content: end"
      v-model:page="page"
      :page-count="totalPage"
      show-quick-jumper
      size="large"
    />
  </n-space>
  <div v-else>
    <n-result
      style="margin-top: 30%"
      status="error"
      title="상품 데이터가 없습니다"
    />
  </div>
</template>
