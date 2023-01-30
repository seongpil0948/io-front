<script setup lang="ts">
import {
  PART,
  toVendorUserGarmentCombined,
  useElasticSearch,
  VendorUserGarmentCombined,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { useCommonStore } from "@/store";
import { computed, onBeforeMount, ref, watchEffect } from "vue";
import {
  genderOpts,
  getCtgrOpts,
  makeMsgOpt,
  partOpts,
  useEventListener,
} from "@/util";
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
    if (!e.target) return;
    const el = e.target as HTMLElement;

    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (distance < el.scrollHeight / 1.5) {
      await loadData();
    }
  },
  1000,
  { trailing: false, leading: true }
);

const noMore = ref(false);
async function loadData() {
  if (searchData.value.length < 1 && !noMore.value) {
    const obj = await VENDOR_GARMENT_DB.listUserGarmentCombined({
      pageSize: 40,
      lastData: data.value[data.value.length - 1],
      // lastData: data.value[0],
    });
    data.value = [...data.value, ...obj.data];
    noMore.value = obj.noMore;
  }
}
onBeforeMount(async () => await loadData());

const part = ref(null);
const ctgr = ref(null);
const gender = ref(null);
const ctgrOpts = computed(() =>
  part.value !== null ? getCtgrOpts(part.value, locale.value) : []
);

const { searchInputVal, searchData, search, msg } = useElasticSearch({
  funcName: "elasticInoutBoxSearch",
  onSearch: async (result) => {
    const data: any = result.data;
    const prodIds: string[] = data.hits.hits.map((x: any) => x._id);
    if (prodIds.length > 0) {
      return VENDOR_GARMENT_DB.listByIds(prodIds)
        .then(async (prods) => {
          return toVendorUserGarmentCombined(prods)
            .then((value) => {
              searchData.value = value;
            })
            .catch((err) =>
              console.error("error in toVendorUserGarmentCombined : ", err)
            );
        })
        .catch((err) => console.error("error in listByIds : ", err));
    } else {
      msg.info("검색 결과가 없습니다.");
      searchData.value = [];
    }
  },
  makeParam: (input) => {
    // TODO: should fuzzy(typo correction)..
    const query = { bool: {} as any };
    const musts = [];
    if (part.value)
      musts.push({
        match: { part: part.value },
      });
    if (ctgr.value)
      musts.push({
        match: { ctgr: ctgr.value },
      });
    if (gender.value)
      musts.push({
        match: { gender: gender.value },
      });
    if (musts.length > 0) {
      query["bool"]["must"] = musts;
    }
    if (input.length > 0) {
      query["bool"]["should"] = [
        {
          multi_match: {
            query: input,
            fields: ["vendorprodname^3", "fabric", "info", "description"],
          },
        },
      ];
    }

    return {
      index:
        import.meta.env.MODE === "production"
          ? ".ent-search-engine-documents-io-box-vendorproduct-prod-search"
          : ".ent-search-engine-documents-io-box-vendorproduct-dev-search",
      query,
      // sort: [
      //   {
      //     "createdat.date": {
      //       order: "desc",
      //     },
      //   },
      // ],
      from: 0,
      size: 100,
    };
  },
});

const targetData = computed(() =>
  searchData.value.length > 0 ? searchData.value : data.value
);

useEventListener(
  () => document.querySelector("[data-test='shop-prod-search-input']"),
  "keyup",
  async (evt: KeyboardEvent) => {
    if (evt.key === "Enter") {
      await searchWrap();
    }
  }
);
async function searchWrap() {
  if (searchInputVal.value && searchInputVal.value.length > 0) {
    await search();
  } else {
    msg.error("검색어를 입력 해주세요.", makeMsgOpt());
  }
}
</script>
<template>
  <shop-add-prod-card
    v-if="selectedProd"
    v-model:showAddModal="showAddModal"
    :prod="selectedProd"
  />
  <n-space vertical item-style="width: 100%">
    <n-space :wrap-item="false" :wrap="false" justify="end">
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
      <n-select v-model:value="gender" :options="genderOpts" clearable />
    </n-space>
    <n-space :wrap-item="false" justify="end" :wrap="false">
      <n-input
        v-model:value="searchInputVal"
        placeholder="상품검색 - 오늘도 신상을 잘 찾아보즈아!"
        data-test="shop-prod-search-input"
      />
      <n-button data-test="shop-prod-search-btn" @click="searchWrap">
        검색
      </n-button>
    </n-space>

    <n-space
      v-if="targetData.length > 0"
      justify="center"
      style="width: 100%"
      item-style="width: 100%"
    >
      <!-- <part-ctgr-menu
        v-model:selectedPart="selectedPart"
        v-model:selectedCtgr="selectedCtgr"
      /> -->
      <n-card style="height: 70vh; overflow: auto">
        <n-scrollbar
          id="image-scroll-container"
          style="max-height: 70vh"
          @scroll="handleScroll"
        >
          <n-grid
            x-gap="12"
            y-gap="12"
            cols="1 s:2 m:3 l:4 xl:5"
            responsive="screen"
          >
            <n-gi v-for="(prod, i) in targetData" :key="i">
              <vendor-prod-thum
                v-if="validProd(prod)"
                style="padding: 5%; margin: auto"
                data-test="shop-prod-thumbnail"
                :prod="prod"
                :width="250"
                @on-click-prod="onClickProd"
              />
            </n-gi>
          </n-grid>
        </n-scrollbar>
      </n-card>
    </n-space>
    <div v-else>
      <n-result
        style="margin-top: 30%"
        status="error"
        title="상품 데이터가 없습니다"
      />
    </div>
  </n-space>
</template>
