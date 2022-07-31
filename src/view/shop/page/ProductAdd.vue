<script setup lang="ts">
import { PART, VendorUserGarmentCombined } from "@/composable";
import { useVendorsStore } from "@/store";
import { ref } from "vue";

const vendorStore = useVendorsStore();
const selectedPart = ref<PART | "전체" | null>(null);
const selectedCtgr = ref<string | null>(null);

const showAddModal = ref(false);
const selectedProd = ref<VendorUserGarmentCombined | null>(null);
function onClickProd(prod: VendorUserGarmentCombined) {
  showAddModal.value = true;
  selectedProd.value = prod;
}
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
</script>
<template>
  <shop-add-prod-card
    v-if="selectedProd"
    v-model:showAddModal="showAddModal"
    :prod="selectedProd"
  />
  <n-space
    v-if="Object.values(vendorStore.vendorUserCombinedGarments).length > 0"
    vertical
    style="width: 100%"
  >
    <!-- ROW1 -->
    <n-space justify="space-between">
      <logo-image size="3rem" />
      <n-input-group
        style="width: 50vw; justify-content: center; padding-top: 1.2%"
      >
        <n-select style="width: 22%" placeholder="전체상품 검색"></n-select>
        <n-input
          placeholder="오늘도 신상을 잘 찾아보즈아!"
          :style="{ width: '50%' }"
        />
        <n-button> 검색 </n-button>
      </n-input-group>
      <logo-image size="3rem" />
    </n-space>
    <!-- ROW2 -->
    <n-space justify="center">
      <!-- <part-ctgr-menu
        v-model:selectedPart="selectedPart"
        v-model:selectedCtgr="selectedCtgr"
      /> -->
      <n-card style="height: 70vh; overflow: scroll">
        <!-- prods -->
        <n-grid
          x-gap="12"
          y-gap="12"
          cols="2 s:2 m:2 l:5 xl:6 2xl:7"
          responsive="screen"
        >
          <n-gi
            v-for="(prod, i) in Object.values(
              vendorStore.vendorUserCombinedGarments
            )"
            :key="i"
          >
            <vendor-prod-thum
              style="width: 200px; height: 200px"
              v-if="validProd(prod)"
              :prod="prod"
              @onClickProd="onClickProd"
            />
          </n-gi>
        </n-grid>
      </n-card>
    </n-space>
  </n-space>
  <div v-else>
    <n-result
      style="margin-top: 30%"
      status="error"
      title="상품 데이터가 없습니다"
    />
  </div>
</template>
