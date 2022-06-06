<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { type FormInst, useMessage, useDialog } from "naive-ui";
import { AddCircleOutline } from "@vicons/ionicons5";
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
  VendorProd,
} from "@/composables";
import { GENDOR, PART, PROD_SIZE, USER_ROLE } from "@/types";
import { useRouter } from "vue-router";

const msg = useMessage();
const dialog = useDialog();
const formRef = ref<FormInst | null>(null);
const currUser = getCurrUser();
const router = useRouter();
const prodModel = ref({
  part: PART.TOP,
  ctgr: "",
  name: "",
  allowPending: [false],
  gendor: GENDOR.MALE,
  price: null,
  vendorPrice: 0,
  titleImgs: [] as string[],
  bodyImgs: [] as string[],
  detailImgs: [] as string[],
  colors: ["black"],
  sizes: [] as PROD_SIZE[],
  stockCnt: 0,
});
const ctgrOpts = computed(() => getCtgrOpts(prodModel.value.part));
const sizesOpts = computed(() => getSizeOpts(prodModel.value.part));

const rules = {
  name: nameLenRule,
  vendorPrice: notNullRule,
  part: notNullRule,
  ctgr: notNullRule,
  allowPending: notNullRule,
  titleImgs: arrLenRule(1),
  bodyImgs: arrLenRule(1),
  detailImgs: arrLenRule(1),
  sizes: arrLenRule(1),
  colors: arrLenRule(1),
};
const products = ref<VendorProd[]>([]);
watchEffect(
  () => {
    if (prodModel.value.allowPending.length > 1) {
      prodModel.value.allowPending.shift();
    }
  },
  { flush: "pre" }
);
watchEffect(() => {
  const v = prodModel.value;
  products.value = [];
  v.sizes.forEach((size) => {
    v.colors.forEach((color) => {
      products.value.push(
        new VendorProd(
          Object.assign(v, {
            allowPending: v.allowPending[0],
            vendorProdName: v.name,
            size,
            color,
            vendorId: currUser.userId,
            vendorProdId: uuidv4(),
          })
        )
      );
    });
  });
});
function onRegister() {
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("상품 작성란을 작성 해주세요");
    else if (currUser.role !== USER_ROLE.VENDOR)
      return msg.error(`User Role is not Valid: ${currUser.role}`);
    dialog.success({
      title: "상품정보 제출",
      content: `${products.value.length}개의 상품을 등록하시겠습니까?`,
      positiveText: "등록",
      negativeText: "취소",
      closeOnEsc: true,
      onPositiveClick: async () => {
        return Promise.all(products.value.map((p) => p.update()))
          .then(() => {
            msg.success("상품등록이 완료되었습니다.");
            router.replace({ name: "VendorProductList" });
          })
          .catch(() => {
            msg.error("상품등록 실패.");
          });
      },
    });
  });
}
</script>
<template>
  <n-card>
    <n-space vertical style="width: 100%">
      <n-space justify="center">
        <n-form
          ref="formRef"
          :model="prodModel"
          :rules="rules"
          label-placement="left"
          require-mark-placement="right-hanging"
          label-width="auto"
        >
          <n-space justify="end">
            <n-space
              inline
              style="width: 100%; text-align: start"
              justify="start"
            >
              <n-image src="/logo.png" height="40" />
              <n-text
                >재고가 부족할 경우
                <br />
                재고수량 상관없이 주문을 받는 옵션</n-text
              >
            </n-space>
          </n-space>
          <n-grid :x-gap="12" cols="1 350:2" item-responsive>
            <n-form-item-gi label="제품명" path="name">
              <n-input v-model:value="prodModel.name" />
            </n-form-item-gi>
            <n-form-item-gi label="자동미송받기" path="allowPending">
              <n-checkbox-group v-model:value="prodModel.allowPending">
                <n-space item-style="display: flex;">
                  <n-checkbox :value="true" label="받기" />
                  <n-checkbox :value="false" label="안받기" /> </n-space
              ></n-checkbox-group>
            </n-form-item-gi>
            <n-form-item-gi label="파트" path="part">
              <n-select v-model:value="prodModel.part" :options="partOpts" />
            </n-form-item-gi>
            <n-form-item-gi label="카테고리" path="ctgr">
              <n-select v-model:value="prodModel.ctgr" :options="ctgrOpts" />
            </n-form-item-gi>
            <n-form-item-gi label="성별" path="part">
              <n-select
                v-model:value="prodModel.gendor"
                :options="gendorOpts"
              />
            </n-form-item-gi>

            <n-form-item-gi label="도매가" path="vendorPrice">
              <n-input-number
                :step="1000"
                v-model:value="prodModel.vendorPrice"
              >
                <template #prefix> ₩ </template>
                <template #suffix> 원 </template>
              </n-input-number>
            </n-form-item-gi>
            <n-grid-item span="2">
              <n-space
                :wrap="false"
                inline
                justify="space-between"
                style="width: 100%"
              >
                <n-space vertical justify="start">
                  <n-form-item label="컬러" path="colors">
                    <n-dynamic-tags
                      style="flex-wrap: ;no-wrap; overflow-x: scroll;"
                      v-model:value="prodModel.colors"
                      @keydown.enter.prevent
                    />
                  </n-form-item>

                  <n-form-item span="2" label="사이즈" path="sizes">
                    <n-select
                      multiple
                      v-model:value="prodModel.sizes"
                      :options="sizesOpts"
                    />
                  </n-form-item>
                </n-space>
                <n-card
                  v-if="products.length > 0"
                  title="재고수량 입력"
                  style="max-height: 20vh; overflow: auto"
                >
                  <div v-for="(prod, i) in products" :key="i">
                    <n-space inline :wrap="false" style="margin-bottom: 1%">
                      <n-text>{{ prod.size }}</n-text>
                      <n-text>{{ prod.color }}</n-text>
                      <n-input-number
                        :show-button="false"
                        :min="0"
                        v-model:value="prod.stockCnt"
                      />
                    </n-space>
                  </div>
                </n-card>
              </n-space>
            </n-grid-item>

            <n-form-item-gi
              span="2"
              :label="`대표이미지(${prodModel.titleImgs.length})`"
              path="titleImgs"
            >
              <single-image-input
                elemetId="titleImgs"
                :user="currUser"
                v-model:urls="prodModel.titleImgs"
                size="100px"
                :max="5"
              >
                <add-circle-outline />
              </single-image-input>
            </n-form-item-gi>
            <n-form-item-gi
              span="2"
              :label="`제품이미지(${prodModel.bodyImgs.length})`"
              path="bodyImgs"
            >
              <single-image-input
                elemetId="bodyImgs"
                :user="currUser"
                v-model:urls="prodModel.bodyImgs"
                size="100px"
                :max="5"
              >
                <add-circle-outline />
              </single-image-input>
            </n-form-item-gi>
            <n-form-item-gi
              span="2"
              :label="`상세이미지(${prodModel.detailImgs.length})`"
              path="detailImgs"
            >
              <single-image-input
                elemetId="detailImgs"
                :user="currUser"
                v-model:urls="prodModel.detailImgs"
                size="100px"
                :max="5"
              >
                <add-circle-outline />
              </single-image-input>
            </n-form-item-gi>
          </n-grid>

          <div style="display: flex; justify-content: flex-end">
            <n-button round type="primary" size="large" @click="onRegister">
              상품등록
            </n-button>
          </div>
        </n-form>
      </n-space>
    </n-space></n-card
  >
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
