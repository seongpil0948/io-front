<script setup lang="ts">
import { GarmentOrder, ORDER_STATE, ProdOrderCombined } from "@/composable";
import { timeToDate } from "@/util";
import { toRefs } from "vue";
const props = defineProps<{
  garmentOrder: GarmentOrder;
  prodOrder: ProdOrderCombined;
  checked: boolean;
}>();
const { garmentOrder, checked, prodOrder } = toRefs(props);
const emits = defineEmits<{
  (e: "onClick", value: string): void;
}>();
function onClickChecker() {
  if (prodOrder.value) emits("onClick", prodOrder.value.id);
}
</script>
<template>
  <n-space v-if="prodOrder" inline>
    <logo-checker :size="1" :checked="checked" @click="onClickChecker" />
    <div style="width: 1vw" />
    <n-text v-if="prodOrder.vendorGarment">
      {{ prodOrder.vendorGarment.vendorProdName }} /
      {{ prodOrder.vendorGarment.color }} /
      {{ prodOrder.vendorGarment.size }}
    </n-text>
    <!-- <n-text v-if="prodOrder.pendingCnt > 0" :type="'error'">
      , 주문/미송 개수: {{ prodOrder.orderCnt }} / ({{ prodOrder.pendingCnt }})
    </n-text>
    <n-text v-else :type="'primary'">, 주문개수: {{ prodOrder.orderCnt }} </n-text> -->
    <shop-order-cnt :order="garmentOrder" :prod-order="prodOrder" />
    <n-text>, 주문상태: {{ ORDER_STATE[prodOrder.state] }} </n-text>
    <n-text v-if="prodOrder.actualAmount.paidDate">
      , 결제일: {{ timeToDate(prodOrder.actualAmount.paidDate, "MIN") }}
    </n-text>
  </n-space>
</template>
