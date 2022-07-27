<script setup lang="ts">
import { SHIP_METHOD, ShopOperInfo } from "@/composable";
import { notNullRule, saleAvgOpt, shipMethodOpt } from "@/util";
import { FormInst } from "naive-ui";
import { reactive, ref } from "vue";
const formRef = ref<FormInst | null>(null);
const formModel = reactive<{ [k in keyof ShopOperInfo]: ShopOperInfo[k] }>({
  saleAverage: saleAvgOpt.value[0].value,
  purchaseMethod: SHIP_METHOD.UNCLE,
});
const rule = {
  saleAverage: notNullRule,
};
defineExpose({ operInfo: formModel });
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
        >
        </n-select>
      </n-form-item-gi>
      <n-form-item-gi label="현재 사입방식" path="purchaseMethod">
        <n-select
          v-model:value="formModel.purchaseMethod"
          placeholder="어떤 방식으로 주문 상품을 배송 받으시나요?"
          :options="shipMethodOpt"
        >
        </n-select>
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>
