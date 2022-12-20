<script setup lang="ts">
import { computed, ref, watchEffect, toRefs } from "vue";
import { type FormInst, useMessage, useDialog } from "naive-ui";
import { AddCircleOutline } from "@vicons/ionicons5";
import { uuidv4 } from "@firebase/util";
import { useRouter } from "vue-router";
import {
  catchError,
  PRODUCT_SIZE,
  GENDER,
  PART,
  PROD_TYPE,
  VendorGarment,
  VENDOR_GARMENT_DB,
  VISIBILITY,
  useVirtualVendorProd,
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
import { useEditor } from "@/plugin/editor";
import { useAuthStore, useCommonStore } from "@/store";
import { storeToRefs } from "pinia";

const props = defineProps<{ minimal: boolean; virtual: boolean }>();
const emits = defineEmits<{
  (e: "onRegistered", value: VendorGarment[]): void;
}>();
const { minimal, virtual } = toRefs(props);

const msg = useMessage();
const dialog = useDialog();
const formRef = ref<FormInst | null>(null);

const auth = useAuthStore();
const uid = computed(() => auth.currUser.userInfo.userId);
const { getVirSimilarProds, existVirSameProd, createVirVendorGarments } =
  useVirtualVendorProd(auth.currUser);
const router = useRouter();
const { saveEditor, clearEditor } = useEditor({
  readOnly: false,
  elementId: "io-editor",
  placeholder: "상품 정보 입력",
});
type StockCnt = { [size in PRODUCT_SIZE]: { [color: string]: number } };
const stockCnts = ref<StockCnt | null>(null);
const prodModel = ref({
  part: PART.TOP,
  ctgr: getCtgrOpts(PART.TOP)[0].value,
  name: "",
  allowPending: [],
  gender: GENDER.MALE,
  price: 1000,
  vendorPrice: 1000,
  primeCost: 1000,
  titleImgs: [] as string[],
  bodyImgs: [] as string[],
  colors: ["black"],
  sizes: [] as PRODUCT_SIZE[],
  stockCnt: 10,
  fabric: "", // 혼용률 / 제조국
  info: "", // 상세정보
  description: "",
});
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

const cs = useCommonStore();
const { locale } = storeToRefs(cs);
const ctgrOpts = computed(() =>
  getCtgrOpts(prodModel.value.part, locale.value)
);
const sizesOpts = computed(() => getSizeOpts(prodModel.value.part));
const rules = {
  part: notNullRule,
  ctgr: notNullRule,
  name: nameLenRule,
  allowPending: notNullRule,
  gender: notNullRule,
  vendorPrice: biggerThanNRule(999),
  primeCost: biggerThanNRule(999),
  colors: arrLenRule(1),
  sizes: arrLenRule(1),
  fabric: notNullRule, // 혼용률 / 제조국
  info: notNullRule, // 상세정보
  description: notNullRule,
};

async function onRegister() {
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("상품 작성란을 작성 해주세요", makeMsgOpt());
    else if (!stockCnts.value) return;
    const products: VendorGarment[] = [];
    const v = prodModel.value;
    const allowPending = v.allowPending[0] === "받기" ? true : false;
    let valid = true;
    const info = await saveEditor();
    const vendorId = uid.value;
    const similarParam = {
      vendorId,
      vendorProdName: v.name,
    };
    const similarProds = virtual.value
      ? await getVirSimilarProds(similarParam)
      : await VENDOR_GARMENT_DB.getSimilarProds(similarParam);
    const vendorProdPkgId =
      similarProds.length > 0 ? similarProds[0].vendorProdPkgId : uuidv4();
    for (let i = 0; i < prodModel.value.sizes.length; i++) {
      const size = prodModel.value.sizes[i];
      for (let j = 0; j < prodModel.value.colors.length; j++) {
        const color = prodModel.value.colors[j];
        const sameParam = {
          vendorId,
          vendorProdName: v.name,
          color,
          size,
        };
        if (stockCnts.value![size][color] < 1) {
          msg.error("상품의 재고량을 1이상으로 설정 해주십시오.");
          valid = false;
        } else if (
          virtual.value
            ? await existVirSameProd(sameParam)
            : await VENDOR_GARMENT_DB.existSameProd(sameParam)
        ) {
          msg.error("같은 상품이 존재합니다.");
          valid = false;
        } else {
          products.push(
            new VendorGarment(
              Object.assign({}, v, {
                allowPending,
                vendorProdName: v.name,
                size,
                color,
                info,
                vendorId,
                vendorProdId: uuidv4(),
                stockCnt: stockCnts.value![size][color],
                TBD: {},
                vendorProdPkgId,
                prodType: "GARMENT" as PROD_TYPE,
                visible: virtual.value ? VISIBILITY.ME : VISIBILITY.GLOBAL,
              })
            )
          );
        }
      }
    }
    if (valid) {
      dialog.success({
        title: "상품을 등록합니다.",
        content: `입력하신 내용으로 상품이 등록됩니다.`,
        positiveText: "등록",
        negativeText: "취소",
        closeOnEsc: true,
        onPositiveClick: async () => {
          cs.$patch({ showSpin: true });
          return (
            virtual.value
              ? createVirVendorGarments(vendorId, products)
              : VENDOR_GARMENT_DB.batchCreate(vendorId, products)
          )
            .then(() => {
              clearEditor();
              emits("onRegistered", products);
              msg.success("상품등록이 완료되었습니다.", makeMsgOpt());
              if (!virtual.value) {
                router.replace({ name: "VendorProductList" });
              }
            })
            .catch((err) =>
              catchError({
                userId: vendorId,
                err,
                opt: makeMsgOpt(),
                prefix: "상품등록 실패",
                msg,
              })
            )
            .finally(() => cs.$patch({ showSpin: false }));
        },
      });
    }
  });
}
</script>
<template>
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
      <n-form-item-gi v-if="!minimal" label="자동미송받기" path="allowPending">
        <n-checkbox-group v-model:value="prodModel.allowPending">
          <n-space item-style="display: flex;">
            <n-checkbox value="받기" label="받기" />
            <n-checkbox value="안받기" label="안받기" />
          </n-space>
        </n-checkbox-group>
      </n-form-item-gi>
      <n-form-item-gi label="파트" path="part">
        <n-select
          v-model:value="prodModel.part"
          :options="partOpts(locale)"
          @update:value="changePart"
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
          v-model:value="prodModel.vendorPrice"
          :min="1000"
          :step="10"
        >
          <template #prefix> ₩ </template>
          <template #suffix> 원 </template>
        </n-input-number>
      </n-form-item-gi>
      <n-form-item-gi v-if="!minimal" label="도매원가" path="primeCost">
        <n-input-number
          v-model:value="prodModel.primeCost"
          :min="1000"
          :step="10"
        >
          <template #prefix> ₩ </template>
          <template #suffix> 원 </template>
        </n-input-number>
      </n-form-item-gi>
      <n-form-item-gi v-if="!minimal" label="혼용률/제조국" path="fabric">
        <n-input
          v-model:value="prodModel.fabric"
          placeholder="원단 정보 입력"
        />
      </n-form-item-gi>
      <n-grid-item span="2">
        <n-space
          :wrap="false"
          inline
          justify="space-between"
          style="width: 100%; margin-bottom: 1%"
        >
          <n-space vertical justify="start" style="padding: 10px; width: 100%">
            <n-form-item label="컬러" path="colors">
              <n-dynamic-tags
                v-model:value="prodModel.colors"
                round
                style="flex-wrap: no-wrap; overflow-x: auto; padding: 5%"
                @keydown.enter.prevent
              />
            </n-form-item>

            <n-form-item span="2" label="사이즈" path="sizes">
              <n-select
                v-model:value="prodModel.sizes"
                placeholder="선택"
                multiple
                :options="sizesOpts"
              />
            </n-form-item>
          </n-space>
          <n-card
            v-if="stockCnts && Object.keys(stockCnts).length > 0"
            title="재고수량 입력"
            style="
              max-height: 20vh;
              overflow: auto;
              min-height: 300px;
              height: 100%;
            "
            :segmented="{
              content: true,
            }"
          >
            <div v-for="(size, i) in Object.keys(stockCnts)" :key="i">
              <div
                v-for="(color, j) in Object.keys(stockCnts[size as PRODUCT_SIZE])"
                :key="j"
              >
                <n-space inline :wrap="false" style="margin-bottom: 1%">
                  <n-form-item-gi span="2" :label="`${color} ${size}`">
                    <n-input-number
                      v-model:value="stockCnts[size as PRODUCT_SIZE][color]"
                      :show-button="false"
                      :min="1"
                      :validator="(x: number) => x % 1 === 0"
                    />
                  </n-form-item-gi>
                </n-space>
              </div>
            </div>
          </n-card>
        </n-space>
      </n-grid-item>
      <n-form-item-gi span="2" label="상품정보" path="info">
        <div id="io-editor" class="io-editor-border" />
      </n-form-item-gi>
      <n-form-item-gi
        v-if="!minimal"
        span="2"
        label="상품 요약"
        path="description"
      >
        <n-input
          v-model:value="prodModel.description"
          placeholder="개요 입력"
        />
      </n-form-item-gi>
      <n-form-item-gi
        v-if="!minimal"
        span="2"
        :label="`대표이미지(${prodModel.titleImgs.length})`"
        path="titleImgs"
      >
        <single-image-input
          v-model:urls="prodModel.titleImgs"
          element-id="titleImgs"
          size="100"
          :max="1"
          svc="VENDOR_PRODUCT"
          :user-id="uid"
          :role="auth.currUserRole"
          parent-id="titleImgs"
        >
          <add-circle-outline style="cursor: pointer" />
        </single-image-input>
      </n-form-item-gi>
      <n-form-item-gi
        v-if="!minimal"
        span="2"
        :label="`제품이미지(${prodModel.bodyImgs.length})`"
        path="bodyImgs"
      >
        <single-image-input
          v-model:urls="prodModel.bodyImgs"
          element-id="bodyImgs"
          size="100"
          :max="20"
          svc="VENDOR_PRODUCT"
          :user-id="uid"
          :role="auth.currUserRole"
          parent-id="bodyImgs"
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
