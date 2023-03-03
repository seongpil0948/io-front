<script setup lang="ts">
import {
  useShopVirtualProd,
  useShopGarmentTable,
  useSearch,
  ShopGarment,
  ProdInnerIdSrc,
  VendorGarment,
  mapTxt,
  getUserName,
  IoUser,
  USER_DB,
} from "@/composable";
import { useAuthStore } from "@/store";
import { NModal, NButton, NCard, NDataTable, NInput, NSpace } from "naive-ui";
import { ref, computed, defineAsyncComponent, watchEffect } from "vue";
import { getIoCollection, ioFireStore } from "@/plugin/firebase";
import { logger } from "@/plugin/logger";
import { getDoc, doc } from "@firebase/firestore";
const BatchCreateVirProd = defineAsyncComponent(
  () => import("@/component/button/shop/BatchCreateVirProd.vue")
);

const auth = useAuthStore();
const uid = auth.currUser().userInfo.userId;
const {
  regitProdModal,
  changeRegitProdModal,
  onRegistered,
  virProdCols,
  searchedData,
  virtualVendors,
  searchInputVal,
  search,
  onCheckedOrder,
  tableRef,
  virtualVendorById,
  virProdEditTarget,
  virShopProds,
  userVirProds,
} = useShopVirtualProd(auth.currUser());
const selectedVendorId = ref<string | null>(null);
const vendorOpts = computed(() =>
  virtualVendors.value.map((v) => ({
    label: getUserName(v),
    value: v.userInfo.userId,
  }))
);

const {
  selectFunc,
  tableCols: prodTableCols,
  openSelectList,
} = useShopGarmentTable(true, userVirProds);
type PartialInner = Partial<ProdInnerIdSrc>;
const batchRef = ref<InstanceType<typeof BatchCreateVirProd> | null>(null);
function onClickId(value: {
  vendorName?: string;
  in: PartialInner;
  ex: PartialInner;
}) {
  console.log("parseData in onClickId: ", value);
  selectFunc.value = async (s) => {
    const g = ShopGarment.fromJson(s);
    if (!g) throw new Error("result of ShopGarment.fromJson is null ");
    value.in.prodName = g.prodName;
    value.in.size = g.size;
    value.in.color = g.color;
    value.in.vendorId = g.vendorId;
    value.vendorName = getUserName(s);
    console.log("selected func: ", s, value);
    batchRef.value?.processJson();
  };
  openSelectList.value = true;
}

const vendorByName = ref<{ [vendorName: string]: IoUser }>({});
watchEffect(async () => {
  Object.keys(virtualVendorById.value).forEach((vk) => {
    const uName = mapTxt(getUserName(virtualVendorById.value[vk]));
    if (!vendorByName.value[uName]) {
      vendorByName.value[uName] = virtualVendorById.value[vk];
    }
  });
  for (let i = 0; i < userVirProds.value.length; i++) {
    const sug = userVirProds.value[i];
    const uName = mapTxt(getUserName(userVirProds.value[i]));
    if (sug.visible === "GLOBAL" && !vendorByName.value[uName]) {
      const u = await USER_DB.getUserById(ioFireStore, sug.vendorId);
      if (u) {
        vendorByName.value[uName] = u;
      } else {
        logger.error(uid, `vendor id${sug.vendorId} is not exist`);
      }
    }
  }
});
const {
  search: search2,
  searchedData: searchedData2,
  searchInputVal: searchInputVal2,
} = useSearch({
  data: userVirProds,
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return v === null
      ? true
      : x.size.includes(v) ||
          x.color.includes(v) ||
          x.prodName.includes(v) ||
          x.userInfo.userName.includes(v);
  },
});

async function submitEdit() {
  const p = virProdEditTarget.value;
  if (!p) return;
  const shopP = virShopProds.value.find(
    (x) => x.vendorProdId === p.vendorProdId
  );
  if (!shopP)
    return logger.error(
      null,
      `virtual vendorProdId ${p.vendorProdId} not exist`
    );
  const result = await getDoc(
    doc(
      getIoCollection(ioFireStore, {
        uid,
        c: "VIRTUAL_VENDOR_PROD",
      }).withConverter(VendorGarment.fireConverter()),
      p.vendorProdId
    )
  );
  const vendorP = result.data();
  if (vendorP) {
    shopP.prodPrice = vendorP.vendorPrice;
    shopP.prodName = vendorP.vendorProdName;
    shopP.info = vendorP.info;
    shopP.description = vendorP.description;
    shopP.size = vendorP.size;
    shopP.color = vendorP.color;
    await shopP.update();
  }

  virProdEditTarget.value = null;
}
</script>
<template>
  <n-space vertical justify="center" align="center" item-style="width: 100%">
    <n-card style="width: 100%">
      <n-space vertical justify="center" align="end" item-style="width: 100%">
        <n-space style="max-height: 40vh; overflow: auto">
          <n-input v-model:value="searchInputVal" placeholder="상품검색" />
          <n-button @click="search"> 검색 </n-button>
          <batch-create-vir-prod
            ref="batchRef"
            :data="userVirProds"
            :user-id="uid"
            :vendor-by-name="vendorByName"
            @select="onClickId"
          />
          <n-button @click="changeRegitProdModal">가상 도매 상품등록</n-button>
          <n-button @click="onCheckedOrder"> 선택 상품 주문 </n-button>
        </n-space>
        <n-data-table
          ref="tableRef"
          :scroll-x="1200"
          :columns="virProdCols"
          :data="searchedData"
          :pagination="{
            showSizePicker: true,
            pageSizes: [5, 10, 25, 50, 100],
          }"
          :bordered="false"
        />
      </n-space>
    </n-card>
    <manage-vir-vendor :virtual-vendors="virtualVendors" />
  </n-space>
  <n-modal v-model:show="openSelectList" style="margin: 5%">
    <n-card title="상품선택">
      <template #header-extra>
        <n-input v-model:value="searchInputVal2" placeholder="상품검색" />
        <n-button @click="search2"> 검색 </n-button>
      </template>
      <n-data-table
        :columns="prodTableCols"
        :data="searchedData2"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="1200"
      />
    </n-card>
  </n-modal>
  <n-modal
    :show="virProdEditTarget !== null"
    preset="card"
    style="width: 70%"
    title="상품 정보 수정"
    :mask-closable="false"
    @esc="virProdEditTarget = null"
    @mask-click="virProdEditTarget = null"
  >
    <vendor-prod-edit-form
      v-if="virProdEditTarget"
      :prod="virProdEditTarget"
      @on-submit-prod="submitEdit"
    />
  </n-modal>
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
</template>
