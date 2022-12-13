<script setup lang="ts">
import {
  type PAY_METHOD,
  OrderItem,
  DefrayParam,
  getTax,
  defrayAmount,
} from "@/composable";
import { ref, toRefs, onBeforeMount, watch } from "vue";
import { payMethodOpts } from "@/util";
const props = defineProps<{
  defray: DefrayParam;
  item: OrderItem;
}>();
const emits = defineEmits<{
  (e: "update:defray", value: DefrayParam): void;
  (e: "update:item", value: OrderItem): void;
}>();
const { item, defray } = toRefs(props);
const paidAmount = ref(defray.value.paidAmount);
function updatePaidAmount() {
  defray.value.paidAmount = paidAmount.value;
  emits("update:defray", defray.value);
  updateAmount();
}
function updatePayMethod(payMethod: PAY_METHOD) {
  defray.value.payMethod = payMethod;
  emits("update:defray", defray.value);
  updateAmount();
}

const isTax = ref(false);
function applyTax(useTax: boolean) {
  if (useTax === isTax.value) return;
  isTax.value = useTax;
}
watch(
  () => isTax.value,
  (isTax, prev) => {
    if (isTax === prev) return console.log("???");
    const tax = isTax ? getTax(item.value.amount.orderAmount) : 0;
    defray.value.tax = tax;
    emits("update:defray", defray.value);
    updateAmount();
  }
);

function updateAmount() {
  console.log("defray", defray.value);
  const { newAmount } = defrayAmount(item.value.amount, defray.value);
  item.value.amount = newAmount;
  console.log("new amount", newAmount);
  emits("update:item", item.value);
}
onBeforeMount(() => updateAmount());

defineExpose({ applyTax });
</script>

<template>
  <n-card v-if="defray && item" :title="item.vendorProd.vendorProdName">
    <n-space justify="space-around">
      <n-space justify="space-around" vertical>
        <n-text type="info"
          >{{ item.vendorProd.size }} / {{ item.vendorProd.color }} /
          {{ item.orderCnt }}</n-text
        >
        <n-space justify="space-between">
          <n-text>청구 금액</n-text>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-text>{{ item.amount.orderAmount }}</n-text>
            </template>
            <n-space vertical>
              <n-text>상품금액: {{ item.amount.pureAmount }}</n-text>
              <n-text>부가세: {{ item.amount.tax }}</n-text>
            </n-space>
          </n-tooltip>
        </n-space>

        <n-text>받은금액</n-text>
        <n-input-number
          v-model:value="paidAmount"
          :step="10"
          :show-button="true"
          style="width: 70%"
          @blur="updatePaidAmount"
        />
      </n-space>
      <n-space justify="space-around" vertical>
        <n-text>결제방식</n-text>
        <n-select
          :value="defray.payMethod"
          :options="payMethodOpts"
          @update:value="updatePayMethod"
        />

        <n-button @click="() => applyTax(!isTax)"
          >부가세 {{ isTax ? "해제" : "적용" }}</n-button
        >
      </n-space>
    </n-space>
  </n-card>
</template>
