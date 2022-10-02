<script setup lang="ts">
import { GarmentOrder, ORDER_STATE, ProdOrderCombined } from "@/composable";
import { commonTime } from "@/util";
import { toRefs, computed } from "vue";
const { timeToDate } = commonTime();
const props = defineProps<{
  garmentOrder: GarmentOrder;
  itemId: string;
  checked: boolean;
}>();
const { garmentOrder, checked, itemId } = toRefs(props);
const prodOrder = computed(
  () =>
    garmentOrder.value.items.find(
      (x) => x.id === itemId.value
    )! as ProdOrderCombined
);
const emits = defineEmits<{
  (e: "onClick", value: string): void;
}>();
function onClickChecker() {
  if (prodOrder.value) emits("onClick", prodOrder.value.id);
}
</script>
<template>
  <n-space inline v-if="prodOrder">
    <logo-checker :size="1" :checked="checked" @click="onClickChecker" />
    <div style="width: 1vw"></div>
    <n-text>
      {{ prodOrder.vendorGarment.vendorProdName }} /
      {{ prodOrder.vendorGarment.color }} /
      {{ prodOrder.vendorGarment.size }}
    </n-text>
    <!-- <n-text v-if="prodOrder.pendingCnt > 0" :type="'error'">
      , 주문/미송 개수: {{ prodOrder.orderCnt }} / ({{ prodOrder.pendingCnt }})
    </n-text>
    <n-text v-else :type="'primary'">, 주문개수: {{ prodOrder.orderCnt }} </n-text> -->
    <shop-order-cnt :order="garmentOrder" :prodOrder="prodOrder" />
    <n-text>, 주문상태: {{ ORDER_STATE[prodOrder.state] }} </n-text>
    <n-text v-if="prodOrder.actualAmount.paidDate"
      >, 결제일: {{ timeToDate(prodOrder.actualAmount.paidDate) }}
    </n-text>
  </n-space>
</template>
