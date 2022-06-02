<script setup lang="ts">
import { useVendors } from "@/composables";
import { PART, CATEGORIES, GENDOR, type VendorUserProdCombined } from "@/types";
import { ref } from "vue";

const { vendorStore } = useVendors();
let selectedPart = ref<PART | null>(null);
function onSelectPart(part: PART) {
  selectedPart.value = part;
}

let showAddModal = ref(false);
let selectedProd = ref<VendorUserProdCombined | null>(null);
function onClickProd(prod: VendorUserProdCombined) {
  showAddModal.value = true;
  selectedProd.value = prod;
}
</script>
<template>
  <shop-add-prod-card
    v-if="selectedProd"
    v-model:showAddModal="showAddModal"
    :prod="selectedProd"
  />
  <n-space vertical style="width: 100%">
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
    <!-- ROW1 -->
    <div style="width: 100%; display: flex">
      <!-- COL1 -->
      <n-card
        content-style="padding: 5px 10px;"
        style="width: 25vw; flex: none"
      >
        <n-tabs type="segment" style="min-width: 100%">
          <n-tab-pane :name="GENDOR.UNISEX" tab="공용">
            <n-space>
              <n-list>
                <n-list-item
                  v-for="(part, i) in Object.keys(PART)"
                  :key="i"
                  @click="onSelectPart(part as PART)"
                  >{{ part }}</n-list-item
                >
              </n-list>
              <n-list v-if="selectedPart">
                <n-list-item
                  v-for="(ctgr, i) in Object.keys(CATEGORIES[selectedPart])"
                  :key="i"
                  >{{ ctgr }}</n-list-item
                >
              </n-list>
            </n-space>
          </n-tab-pane>
          <n-tab-pane :name="GENDOR.FEMALE" tab="여성"></n-tab-pane>
          <n-tab-pane :name="GENDOR.MALE" tab="남성"></n-tab-pane>
        </n-tabs>
      </n-card>
      <!-- COL2 -->
      <n-card>
        <!-- prods -->
        <n-grid
          x-gap="12"
          y-gap="12"
          cols="1 s:2 m:2 l:5 xl:6 2xl:7"
          responsive="screen"
        >
          <n-gi
            v-for="(prod, i) in Object.values(
              vendorStore.vendorUserCombinedProds
            )"
            :key="i"
          >
            <vendor-prod-thum
              style="width: 150px; height: 100%"
              :prod="prod"
              @onClickProd="onClickProd"
            />
          </n-gi>
        </n-grid>
      </n-card>
    </div>
  </n-space>
</template>
