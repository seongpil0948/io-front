<script setup lang="ts">
import { notNullRule, newProdQuantityOpt, deadOpt } from "@/composables";
import { SALE_MANAGE, VendorOperInfo } from "@/types";
import { FormInst } from "naive-ui";
import { reactive, ref } from "vue";
const formRef = ref<FormInst | null>(null);
const formModel = reactive<{ [k in keyof VendorOperInfo]: VendorOperInfo[k] }>({
  autoPending: false,
  autoOrderApprove: false,
  saleManageType: "",
  taxDeadlineDay: 1,
  expectNumProdMonthly: newProdQuantityOpt.value[0].value,
});
const rule = {
  saleManageType: notNullRule,
};
defineExpose({ operInfo: formModel });
</script>

<template>
  <n-h2>도매 운영정보</n-h2>
  <n-form
    ref="formRef"
    style="width: 60%"
    inline
    :label-width="80"
    label-placement="top"
    :model="formModel"
    :rules="rule"
    size="medium"
  >
    <n-grid cols="1" :x-gap="24">
      <n-form-item-gi label="상품 자동 미송받기" path="autoPending">
        <yes-or-no-radio
          v-model:value="formModel.autoPending"
          :yesVal="true"
          :noVal="false"
        />
      </n-form-item-gi>
      <n-form-item-gi label="상품 주문 자동 승인" path="autoOrderApprove">
        <yes-or-no-radio
          v-model:value="formModel.autoOrderApprove"
          :yesVal="true"
          :noVal="false"
        />
      </n-form-item-gi>
      <n-form-item-gi label="현 장기 종류" path="saleManageType">
        <yes-or-no-radio
          v-model:value="formModel.saleManageType"
          :yesVal="SALE_MANAGE.HAND_WRITE"
          yesLabel="수기"
          :noVal="SALE_MANAGE.ONLINE"
          noLabel="포스&온라인"
        />
      </n-form-item-gi>
      <n-form-item-gi label="월 세금계산서 마감일" path="taxDeadlineDay">
        <n-select v-model:value="formModel.taxDeadlineDay" :options="deadOpt" />
      </n-form-item-gi>
      <n-form-item-gi label="월 평균 신상수량" path="expectNumProdMonthly">
        <n-select
          v-model:value="formModel.expectNumProdMonthly"
          placeholder="월 신상 등록빈도가?"
          :options="newProdQuantityOpt"
        >
        </n-select>
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>
