<script setup lang="ts">
import { OrderAmounts } from "@/composable";
import { toRefs, defineAsyncComponent } from "vue";
const props = defineProps<{
  amounts: OrderAmounts;
}>();
const PayAmountCard = defineAsyncComponent(
  () => import("@/component/card/PayAmountCard.vue")
);
const { amounts: a } = toRefs(props);
</script>
<template>
  <n-space vertical style="max-height: 60vh; overflow-y: auto">
    <n-h5>상품 결제금액</n-h5>
    <PayAmountCard :amount="a.prodAmount" />
    <n-h5>픽업 결제금액</n-h5>
    <PayAmountCard :amount="a.pickAmount" />
    <n-h5>배송 결제금액</n-h5>
    <PayAmountCard :amount="a.shipAmount" />
  </n-space>
</template>
