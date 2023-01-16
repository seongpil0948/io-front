<script setup lang="ts">
import { ShopOperInfo } from "@io-boxies/js-lib";
import { notNullRule, saleAvgOpt, shipMethodOpt } from "@/util";
import { FormInst, useMessage } from "naive-ui";
import { ref, toRefs, watch } from "vue";
import { catchError, defaultShopOper } from "@/composable";

const props = defineProps<{
  shopOperInfo?: ShopOperInfo;
}>();
const { shopOperInfo } = toRefs(props);
const formRef = ref<FormInst | null>(null);
const formModel = ref<{ [k in keyof ShopOperInfo]: ShopOperInfo[k] }>(
  defaultShopOper()
);
watch(
  () => shopOperInfo?.value,
  (val) => Object.assign(formModel.value, val)
);
const rule = {
  saleAverage: notNullRule,
};
const msg = useMessage();

type GetShopOperInfo = { shopOperInfo?: ShopOperInfo };
async function getShopOperInfo(): Promise<GetShopOperInfo> {
  const defaultVal = { shopOperInfo: undefined };
  return new Promise<GetShopOperInfo>((resolve, reject) => {
    if (!formRef.value) return reject("재시도해주세요.");
    formRef.value.validate((errors) => {
      if (errors) {
        return reject("잘못된 양식의 작성입니다.");
      }
      resolve({ shopOperInfo: formModel.value });
    });
  }).catch((err) => {
    catchError({
      err,
      msg,
    });
    return defaultVal;
  });
}
defineExpose({ getShopOperInfo });
</script>

<template>
  <n-h2>소매 운영정보</n-h2>
  <n-form
    ref="formRef"
    inline
    :label-width="80"
    label-placement="top"
    :model="formModel"
    :rules="rule"
    size="medium"
  >
    <n-grid cols="1" :x-gap="24">
      <n-form-item-gi label="1달 평균 판매량" path="saleAverage">
        <n-select
          v-model:value="formModel.saleAverage"
          placeholder="월 판매량이 어떻게 되시나요?"
          :options="saleAvgOpt"
        />
      </n-form-item-gi>
      <n-form-item-gi label="현재 사입방식" path="purchaseMethod">
        <n-select
          v-model:value="formModel.purchaseMethod"
          placeholder="어떤 방식으로 주문 상품을 배송 받으시나요?"
          :options="shipMethodOpt"
        />
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>
