<script setup lang="ts">
import { PaidInfoDict, PayMethodDict, PayAmount } from "@/composable";
import { useCommonStore } from "@/store";
import { formatDate, loadDate } from "@io-boxies/js-lib";
import { toRefs } from "vue";
import { storeToRefs } from "pinia";
const props = defineProps<{
  amount: PayAmount;
}>();
const { amount: a } = toRefs(props);
const cs = useCommonStore();
const { locale } = storeToRefs(cs);
</script>
<template>
  <n-card>
    <n-space vertical>
      <n-space>
        <n-text strong>청구금액</n-text>
        <n-text type="info">{{ a.amount }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>순수상품금액</n-text>
        <n-text type="info">{{ a.pureAmount }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>결제금액</n-text>
        <n-text type="info">{{ a.paidAmount }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>결제상태</n-text>
        <n-text type="info">{{ PaidInfoDict[locale][a.paid] }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>세금/부가세</n-text>
        <n-text type="info">{{ a.tax }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>지불확인</n-text>
        <n-text type="info">{{ a.paymentConfirm }}</n-text>
      </n-space>
      <n-space v-if="a.paymentMethod">
        <n-text strong>결제수단</n-text>
        <n-text type="info">{{
          PayMethodDict[locale][a.paymentMethod]
        }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>결제일</n-text>
        <n-text type="info">{{
          a.paidAt ? formatDate(loadDate(a.paidAt), "MIN") : "-"
        }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>할인액</n-text>
        <n-text type="info">{{ a.discountAmount }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>보류액</n-text>
        <n-text type="info">{{ a.pendingAmount }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>보류상태</n-text>
        <n-text type="info">{{ a.isPending }}</n-text>
      </n-space>
    </n-space>
  </n-card>
</template>
