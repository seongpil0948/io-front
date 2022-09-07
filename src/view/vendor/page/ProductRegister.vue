<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { type FormInst, useMessage, useDialog } from "naive-ui";
import { AddCircleOutline } from "@vicons/ionicons5";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "vue-router";
import { useLogger } from "vue-logger-plugin";
import {
  GARMENT_SIZE,
  GENDER,
  getCurrUser,
  PART,
  VendorGarment,
} from "@/composable";
import {
  getCtgrOpts,
  getSizeOpts,
  notNullRule,
  nameLenRule,
  biggerThanNRule,
  arrLenRule,
  makeMsgOpt,
  partOpts,
  genderOpts,
} from "@/util";

const log = useLogger();
const msg = useMessage();
const dialog = useDialog();
const formRef = ref<FormInst | null>(null);
const currUser = getCurrUser();
const router = useRouter();

const prodModel = ref({
  part: PART.TOP,
  ctgr: getCtgrOpts(PART.TOP)[0].value,
  name: "",
  allowPending: [],
  gender: GENDER.MALE,
  price: 1000,
  vendorPrice: 1000,
  titleImgs: [] as string[],
  bodyImgs: [] as string[],
  colors: ["black"],
  sizes: [] as GARMENT_SIZE[],
  stockCnt: 10,
  fabric: "", // 혼용률 / 제조국
  info: "", // 상세정보
  description: "",
});
const ctgrOpts = computed(() => getCtgrOpts(prodModel.value.part));
const sizesOpts = computed(() => getSizeOpts(prodModel.value.part));
const rules = {
  part: notNullRule,
  ctgr: notNullRule,
  name: nameLenRule,
  allowPending: notNullRule,
  gender: notNullRule,
  vendorPrice: biggerThanNRule(999),
  titleImgs: arrLenRule(1),
  bodyImgs: arrLenRule(1),
  colors: arrLenRule(1),
  sizes: arrLenRule(1),
  fabric: notNullRule, // 혼용률 / 제조국
  info: notNullRule, // 상세정보
  description: notNullRule,
};
type StockCnt = { [size in GARMENT_SIZE]: { [color: string]: number } };
const stockCnts = ref<StockCnt | null>(null);

watchEffect(() => {
  const v = prodModel.value;
  if (v.allowPending.length > 1) {
    v.allowPending.shift();
  }
});
watchEffect(
  () => {
    const prev = Object.assign({}, stockCnts.value);
    stockCnts.value = {} as StockCnt;
    prodModel.value.sizes.forEach((size) => {
      prodModel.value.colors.forEach((color) => {
        if (!stockCnts.value![size]) {
          stockCnts.value![size] = {};
        }
        stockCnts.value![size][color] =
          prev[size] && prev[size][color] ? prev[size][color] : 0;
      });
    });
  },
  { flush: "pre" }
);
function changePart() {
  prodModel.value.ctgr = ctgrOpts.value[0].value;
}
function onRegister() {
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("상품 작성란을 작성 해주세요", makeMsgOpt());
    else if (!stockCnts.value) return;

    const products: VendorGarment[] = [];
    const v = prodModel.value;
    const allowPending = v.allowPending[0] === "받기" ? true : false;
    let valid = true;
    prodModel.value.sizes.forEach((size) => {
      prodModel.value.colors.forEach((color) => {
        if (stockCnts.value![size][color] < 1) {
          msg.error("상품의 재고량을 1이상으로 설정 해주십시오.");
          valid = false;
        }
        products.push(
          new VendorGarment(
            Object.assign({}, v, {
              allowPending,
              vendorProdName: v.name,
              size,
              color,
              vendorId: currUser.userInfo.userId,
              vendorProdId: uuidv4(),
              stockCnt: stockCnts.value![size][color],
            })
          )
        );
      });
    });
    if (valid) {
      dialog.success({
        title: "상품정보 제출",
        content: `${products.length}개의 상품을 등록하시겠습니까?`,
        positiveText: "등록",
        negativeText: "취소",
        closeOnEsc: true,
        onPositiveClick: async () => {
          log.debug("PRODS:", products);
          return Promise.all(products.map((p) => p.update()))
            .then(() => {
              msg.success("상품등록이 완료되었습니다.", makeMsgOpt());
              log.info(currUser.userInfo.userId, "상품 등록 성공", products);
              router.replace({ name: "VendorProductList" });
            })
            .catch(() => {
              msg.error("상품등록 실패.", makeMsgOpt());
              log.error(currUser.userInfo.userId, "상품등록 실패.", products);
            });
        },
      });
    }
  });
}
</script>
<template>
  <n-card>
    <n-form
      ref="formRef"
      :model="prodModel"
      :rules="rules"
      label-placement="left"
      require-mark-placement="right-hanging"
      label-width="auto"
    >
      <n-grid :x-gap="12" cols="1 600:2" item-responsive>
        <n-form-item-gi label="제품명" path="name">
          <n-input v-model:value="prodModel.name" placeholder="제품명 입력" />
        </n-form-item-gi>
        <n-form-item-gi label="자동미송받기" path="allowPending">
          <n-checkbox-group v-model:value="prodModel.allowPending">
            <n-space item-style="display: flex;">
              <n-checkbox value="받기" label="받기" />
              <n-checkbox value="안받기" label="안받기" /> </n-space
          ></n-checkbox-group>
        </n-form-item-gi>
        <n-form-item-gi label="파트" path="part">
          <n-select
            @update:value="changePart"
            v-model:value="prodModel.part"
            :options="partOpts"
          />
        </n-form-item-gi>
        <n-form-item-gi label="카테고리" path="ctgr">
          <n-select v-model:value="prodModel.ctgr" :options="ctgrOpts" />
        </n-form-item-gi>
        <n-form-item-gi label="성별" path="part">
          <n-select v-model:value="prodModel.gender" :options="genderOpts" />
        </n-form-item-gi>

        <n-form-item-gi label="도매가" path="vendorPrice">
          <n-input-number
            :min="1000"
            :step="10"
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
            style="width: 100%; margin-bottom: 5%"
          >
            <n-space vertical justify="start">
              <n-form-item label="컬러" path="colors">
                <n-dynamic-tags
                  round
                  style="flex-wrap: ;no-wrap; overflow-x: scroll;"
                  v-model:value="prodModel.colors"
                  @keydown.enter.prevent
                />
              </n-form-item>

              <n-form-item span="2" label="사이즈" path="sizes">
                <n-select
                  placeholder="선택"
                  multiple
                  v-model:value="prodModel.sizes"
                  :options="sizesOpts"
                />
              </n-form-item>
            </n-space>
            <n-card
              v-if="stockCnts && Object.keys(stockCnts).length > 0"
              title="재고수량 입력"
              style="max-height: 20vh; overflow: auto"
            >
              <div v-for="(size, i) in Object.keys(stockCnts)" :key="i">
                <div
                  v-for="(color, j) in Object.keys(stockCnts[size as GARMENT_SIZE])"
                  :key="j"
                >
                  <n-space inline :wrap="false" style="margin-bottom: 1%">
                    <n-form-item-gi span="2" :label="`${color} ${size}`">
                      <n-input-number
                        :show-button="false"
                        :min="1"
                        :validator="(x: number) => x % 1 === 0"
                        v-model:value="stockCnts[size as GARMENT_SIZE][color]"
                      />
                    </n-form-item-gi>
                  </n-space>
                </div>
              </div>
            </n-card>
          </n-space>
        </n-grid-item>
        <n-form-item-gi span="2" label="상품정보" path="info">
          <n-input
            v-model:value="prodModel.info"
            type="textarea"
            placeholder="상품 정보 입력"
          />
        </n-form-item-gi>
        <n-form-item-gi span="2" label="상품 요약" path="description">
          <n-input
            v-model:value="prodModel.description"
            placeholder="개요 입력"
          />
        </n-form-item-gi>
        <n-form-item-gi span="2" label="혼용률/제조국" path="fabric">
          <n-input
            v-model:value="prodModel.fabric"
            placeholder="원단 정보 입력"
          />
        </n-form-item-gi>
        <n-form-item-gi
          span="2"
          :label="`대표이미지(${prodModel.titleImgs.length})`"
          path="titleImgs"
        >
          <single-image-input
            elementId="titleImgs"
            :user="currUser"
            v-model:urls="prodModel.titleImgs"
            size="100"
            :max="5"
          >
            <add-circle-outline style="cursor: pointer" />
          </single-image-input>
        </n-form-item-gi>
        <n-form-item-gi
          span="2"
          :label="`제품이미지(${prodModel.bodyImgs.length})`"
          path="bodyImgs"
        >
          <single-image-input
            elementId="bodyImgs"
            :user="currUser"
            v-model:urls="prodModel.bodyImgs"
            size="100"
            :max="5"
          >
            <add-circle-outline style="cursor: pointer" />
          </single-image-input>
        </n-form-item-gi>
      </n-grid>

      <div style="display: flex; justify-content: flex-end">
        <n-button round type="primary" size="large" @click="onRegister">
          상품등록
        </n-button>
      </div>
    </n-form>
  </n-card>
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
