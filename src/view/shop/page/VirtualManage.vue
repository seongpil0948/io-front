<script setup lang="ts">
import {
  useSearch,
  useVendorProdCols,
  useVirtualVendorProd,
} from "@/composable";
import { useAuthStore } from "@/store";
import { NModal, NButton } from "naive-ui";
import { computed, ref, onBeforeMount } from "vue";
// TODO: 상품 등록후 상품들 다시 받아오기
// TODO: 가상 상품건에 대한 매핑 정보 관리
// TODO: 가상 주문건 등록. (요청전까지)
// 주문 번호등 정보는 가상에서 전환했을때나 실제 주문에서도 중복을 방지하기 위해... 기존 컬렉션과 겹쳐야 할듯. 다음단계로만 못넘어가게. (완료처리론 넘겨도 되지않나?)
// 회의필요.

const regitProdModal = ref(false);
function changeRegitProdModal() {
  regitProdModal.value = !regitProdModal.value;
}
const auth = useAuthStore();
const uid = computed(() => auth.currUser.userInfo.userId);
const { columns } = useVendorProdCols(false, false);
const { getVirProds, virProds } = useVirtualVendorProd(uid);
const { search, searchedData, searchInputVal } = useSearch({
  data: virProds,
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return v === null
      ? true
      : x.size.includes(v) ||
          x.color.includes(v) ||
          x.vendorProdName.includes(v);
  },
});
onBeforeMount(getVirProds);
</script>
<template>
  <n-modal
    v-model:show="regitProdModal"
    :mask-closable="false"
    preset="card"
    title="도매 상품 등록"
    style="width: 80vw"
  >
    <vendor-garment-form :minimal="true" :virtual="true" />
  </n-modal>
  <n-card style="width: 100%">
    <template #header> 가상 상품관리 </template>
    <template #header-extra>
      <n-space>
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search"> 검색 </n-button>
        <n-button @click="changeRegitProdModal">가상 도매 상품등록</n-button>
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

  <not-implemented />
</template>
