<script setup lang="ts">
import { useShopVirtualProd } from "@/composable";
import { useAuthStore } from "@/store";
import { NModal, NButton } from "naive-ui";
import { isMobile } from "@io-boxies/js-lib";
// TODO: 상품 수정 및 삭제 기능 추가

const auth = useAuthStore();
const {
  regitProdModal,
  changeRegitProdModal,
  onRegistered,
  popVal,
  selectedRow,
  virShopCols,
  searchedData,
  searchInputVal,
  search,
  onCheckedOrder,
} = useShopVirtualProd(auth.currUser);
</script>
<template>
  <n-modal
    v-model:show="regitProdModal"
    :mask-closable="false"
    preset="card"
    title="도매 상품 등록"
    style="width: 80vw"
  >
    <vendor-garment-form
      :minimal="true"
      :virtual="true"
      @registered="onRegistered"
    />
  </n-modal>
  <n-card style="width: 100%">
    <template #header> 가상 상품관리 </template>
    <template #header-extra>
      <n-space>
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search"> 검색 </n-button>
        <n-button @click="changeRegitProdModal">가상 도매 상품등록</n-button>
        <n-button
          v-if="!isMobile()"
          size="small"
          round
          type="primary"
          @click="onCheckedOrder"
        >
          선택 상품 주문
        </n-button>
      </n-space>
    </template>
    <n-data-table
      :scroll-x="1200"
      :columns="virShopCols"
      :data="searchedData"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <shop-prod-modify-modal
    v-if="popVal === 'Edit'"
    v-model:userProd="selectedRow"
    @on-close="selectedRow = null"
  />
</template>
