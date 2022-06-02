<script setup lang="ts">
import { computed, ref } from "vue";
import { type FormInst, useMessage } from "naive-ui";
import { v4 as uuidv4 } from "uuid";
import {
  arrLenRule,
  nameLenRule,
  notNullRule,
  getCurrUser,
  gendorOpts,
  partOpts,
  getCtgrOpts,
  getSizeOpts,
} from "@/composables";
import { refByRoleSvc, uploadFile } from "@/plugins/firebase";
import {
  GENDOR,
  PART,
  STORAGE_SVC,
  USER_ROLE,
  type StockCntObj,
  type VendorProdCombined,
} from "@/types";
import { useRouter } from "vue-router";
const msg = useMessage();
const formRef = ref<FormInst | null>(null);
const currUser = getCurrUser();
const router = useRouter();
const prodModel = ref({
  name: "",
  gendor: GENDOR.MALE,
  part: PART.TOP,
  ctgr: "",
  price: null,
  vendorPrice: 0,
  titleImgs: [],
  bodyImgs: [],
  detailImgs: [],
  colors: ["black"],
  sizes: [],
  stockCnt: 0,
});
const ctgrOpts = computed(() => getCtgrOpts(prodModel.value.part));
const sizesOpts = computed(() => getSizeOpts(prodModel.value.part));
const combineProd = ref<VendorProdCombined | null>(null);

const rules = {
  name: nameLenRule,
  vendorPrice: notNullRule,
  part: notNullRule,
  ctgr: notNullRule,
  titleImgs: arrLenRule(1),
  bodyImgs: arrLenRule(1),
  detailImgs: arrLenRule(1),
  sizes: arrLenRule(1),
  colors: arrLenRule(1),
  stockCnt: notNullRule,
};
let showRegitModal = ref(false);
function onRegitClose() {
  combineProd.value = null;
  showRegitModal.value = false;
  router.replace({ name: "VendorProductList" });
}
function onRegister() {
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("상품 작성란을 작성 해주세요");
    else if (currUser.role !== USER_ROLE.VENDOR)
      return msg.error(`User Role is not Valid: ${currUser.role}`);
    const parent = refByRoleSvc(
      currUser.role,
      STORAGE_SVC.VENDOR_PRODUCT,
      currUser.userId
    );
    const v = prodModel.value;
    const tImgs = await uploadFile(parent, v.titleImgs);
    const bodyImgs = await uploadFile(parent, v.bodyImgs);
    const detailImgs = await uploadFile(parent, v.detailImgs);
    let stockCntObj: { [s: string]: any } = {};
    v.sizes.forEach((s) => (stockCntObj[s] = {}));
    v.colors.forEach((c) => {
      Object.keys(stockCntObj).forEach(
        (s) => (stockCntObj[s][c] = { stockCnt: v.stockCnt, prodId: uuidv4() })
      );
    });

    combineProd.value = {
      createdAt: new Date(),
      updatedAt: new Date(),
      vendorId: currUser.userId,
      vendorProdName: v.name,
      gendor: v.gendor,
      part: v.part as PART,
      ctgr: v.ctgr as string,
      colors: v.colors,
      vendorPrice: v.vendorPrice,
      stockCnt: stockCntObj as StockCntObj,
      titleImgs: tImgs,
      bodyImgs,
      detailImgs,
      sizes: v.sizes,
      allStockCnt: 0,
    };
    showRegitModal.value = true;
  });
}
</script>
<template>
  <regit-vendor-prod
    v-if="combineProd"
    :showRegitModal="showRegitModal"
    @update:showRegitModal="onRegitClose"
    :combineProd="combineProd"
  />
  <n-space vertical style="width: 100%">
    <n-h1>상품등록</n-h1>
    <n-space justify="center">
      <n-form
        ref="formRef"
        :model="prodModel"
        :rules="rules"
        label-placement="left"
        require-mark-placement="right-hanging"
        label-width="auto"
      >
        <n-form-item label="제품명" path="name">
          <n-input v-model:value="prodModel.name" />
        </n-form-item>
        <n-form-item label="성별" path="part">
          <n-select v-model:value="prodModel.gendor" :options="gendorOpts" />
        </n-form-item>
        <n-form-item label="파트" path="part">
          <n-select v-model:value="prodModel.part" :options="partOpts" />
        </n-form-item>
        <n-form-item label="카테고리" path="ctgr">
          <n-select v-model:value="prodModel.ctgr" :options="ctgrOpts" />
        </n-form-item>
        <n-form-item label="도매가" path="vendorPrice">
          <n-input-number :step="1000" v-model:value="prodModel.vendorPrice">
            <template #prefix> ₩ </template>
            <template #suffix> 원 </template>
          </n-input-number>
        </n-form-item>
        <n-form-item
          :label="`대표이미지(${prodModel.titleImgs.length})`"
          path="inputValue"
        >
          <drop-zone-card v-model:fileModel="prodModel.titleImgs" />
        </n-form-item>
        <n-form-item
          :label="`제품이미지(${prodModel.bodyImgs.length})`"
          path="detailImgs"
        >
          <drop-zone-card v-model:fileModel="prodModel.bodyImgs" />
        </n-form-item>
        <n-form-item
          :label="`상세이미지(${prodModel.detailImgs.length})`"
          path="bodyImgs"
        >
          <drop-zone-card v-model:fileModel="prodModel.detailImgs" />
        </n-form-item>
        <n-dynamic-input
          v-model:value="prodModel.colors"
          item-style="margin-bottom: 0;"
          #="{ index, value }"
        >
          <n-form-item
            ignore-path-change
            :required="true"
            :label="`가용컬러(${index})`"
            :path="`prodModel.colors[${index}]`"
          >
            <n-input
              v-model:value="prodModel.colors[index]"
              placeholder="컬러"
              @keydown.enter.prevent
            />
          </n-form-item>
        </n-dynamic-input>
        <n-form-item label="사이즈" path="sizes">
          <n-select
            multiple
            v-model:value="prodModel.sizes"
            :options="sizesOpts"
          />
        </n-form-item>
        <n-form-item label="재고개수" path="stockCnt">
          <n-input-number v-model:value="prodModel.stockCnt" :min="0" />
        </n-form-item>
        <div style="display: flex; justify-content: flex-end">
          <n-button round type="primary" @click="onRegister">
            상품등록
          </n-button>
        </div>
      </n-form>
    </n-space>

    <!-- <div v-for="(prd, idx) in prds" :key="idx">
      <n-image :src="prd.titleImgs"></n-image>
      {{ prd }}
    </div> -->
  </n-space>
</template>
<style scoped>
.n-input-number {
  width: 100%;
}
.n-input {
  width: 100%;
}
.n-select {
  width: 100%;
}
</style>
