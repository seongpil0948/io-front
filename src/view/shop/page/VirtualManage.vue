<script setup lang="ts">
import { useShopVirtualProd, useVirtualVendor } from "@/composable";
import { useAuthStore } from "@/store";
import { isMobile } from "@/util";
import { NModal, NButton, NCard, NDataTable, NInput, NSpace } from "naive-ui";
import { ref, computed } from "vue";
import { getUserName } from "@io-boxies/js-lib";
const auth = useAuthStore();
const { virtualVendors } = useVirtualVendor(auth.currUser.userInfo.userId);
const selectedVendorId = ref<string | null>(null);
const vendorOpts = computed(() =>
  virtualVendors.value.map((v) => ({
    label: getUserName(v),
    value: v.userInfo.userId,
  }))
);
const {
  regitProdModal,
  changeRegitProdModal,
  onRegistered,
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
    <n-space vertical item-style="width: 100%">
      <n-select
        v-model:value="selectedVendorId"
        clearable
        placeholder="가상 도매처 선택"
        :options="vendorOpts"
      />
      <vendor-garment-form
        v-if="selectedVendorId"
        :minimal="true"
        :virtual="true"
        :vendor-id="selectedVendorId"
        @on-registered="onRegistered"
      />
    </n-space>
  </n-modal>
  <n-space vertical>
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
    <manage-vir-vendor :virtual-vendors="virtualVendors" />
  </n-space>
</template>
