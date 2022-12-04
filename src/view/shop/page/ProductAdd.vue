<script setup lang="ts">
import {
  PART,
  useSearch,
  VendorUserGarmentCombined,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { useCommonStore } from "@/store";
import { computed, onBeforeMount, ref, watchEffect } from "vue";
import { getCtgrOpts, partOpts } from "@/util";
import { storeToRefs } from "pinia";
import throttle from "lodash.throttle";

const selectedPart = ref<PART | "전체" | null>(null);
const selectedCtgr = ref<string | null>(null);
const cs = useCommonStore();
const { locale } = storeToRefs(cs);
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

const data = ref<VendorUserGarmentCombined[]>([]);
const handleScroll = throttle(
  async (e: MouseEvent) => {
    console.log("handle scroll", e);
    if (!e.target) return;
    const el = e.target as HTMLElement;

    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (distance < 500) {
      console.log("load data!", distance, el.scrollHeight);
      await loadData();
    }
  },
  500,
  { trailing: false, leading: true }
);

const noMore = ref(false);
async function loadData() {
  if (!noMore.value) {
    const obj = await VENDOR_GARMENT_DB.listUserGarmentCombined({
      pageSize: 30,
      lastData: data.value[data.value.length - 1],
      // lastData: data.value[0],
    });
    data.value = [...data.value, ...obj.data];
    noMore.value = obj.noMore;
  }
}
onBeforeMount(async () => await loadData());
const { search, searchedData, searchInputVal } = useSearch({
  data,
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

const part = ref(null);
const ctgr = ref(null);
const ctgrOpts = computed(() =>
  part.value !== null ? getCtgrOpts(part.value, locale.value) : []
);
</script>
<template>
  <shop-add-prod-card
    v-if="selectedProd"
    v-model:showAddModal="showAddModal"
    :prod="selectedProd"
  />
  <n-space
    v-if="searchedData.length > 0"
    vertical
    style="width: 100%"
    item-style="width: 100%"
  >
    <n-space justify="center">
      <n-input
        v-model:value="searchInputVal"
        placeholder="상품검색 - 오늘도 신상을 잘 찾아보즈아!"
        style="width: 30vw"
      />
      <n-button @click="search"> 검색 </n-button>
      <n-select
        v-model:value="part"
        placeholder="파트선택"
        clearable
        :options="partOpts(locale)"
      />
      <n-select
        v-model:value="ctgr"
        placeholder="카테고리선택"
        clearable
        :options="ctgrOpts"
      />
    </n-space>
    <n-space justify="center" style="width: 100%" item-style="width: 100%">
      <!-- <part-ctgr-menu
        v-model:selectedPart="selectedPart"
        v-model:selectedCtgr="selectedCtgr"
      /> -->
      <n-card style="height: 70vh; overflow: auto">
        <n-scrollbar style="max-height: 70vh" @scroll="handleScroll">
          <n-grid
            x-gap="12"
            y-gap="12"
            cols="1 s:2 m:3 l:4 xl:5"
            responsive="screen"
          >
            <n-gi v-for="(prod, i) in data" :key="i">
              <vendor-prod-thum
                v-if="validProd(prod)"
                style="padding: 5%; margin: auto"
                :prod="prod"
                :width="250"
                @on-click-prod="onClickProd"
              />
            </n-gi>
          </n-grid>
        </n-scrollbar>
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
