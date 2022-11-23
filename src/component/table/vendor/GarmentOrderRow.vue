<script setup lang="ts">
import { IoOrder, ORDER_STATE, OrderItemCombined } from "@/composable";
import { timeToDate } from "@io-boxies/js-lib";
import { toRefs } from "vue";

const props = defineProps<{
  garmentOrder: IoOrder;
  orderItem: OrderItemCombined;
  checked: boolean;
}>();
const { garmentOrder, checked, orderItem } = toRefs(props);
const emits = defineEmits<{
  (e: "onClick", value: string): void;
}>();
function onClickChecker() {
  if (orderItem.value) emits("onClick", orderItem.value.id);
}
</script>
<template>
  <n-space v-if="orderItem" inline>
    <logo-checker :size="1" :checked="checked" @click="onClickChecker" />
    <div style="width: 1vw" />
    <n-text v-if="orderItem.vendorProd">
      {{ orderItem.vendorProd.vendorProdName }} /
      {{ orderItem.vendorProd.color }} /
      {{ orderItem.vendorProd.size }}
    </n-text>
    <!-- <n-text v-if="orderItem.pendingCnt > 0" :type="'error'">
      , 주문/미송 개수: {{ orderItem.orderCnt }} / ({{ orderItem.pendingCnt }})
    </n-text>
    <n-text v-else :type="'primary'">, 주문개수: {{ orderItem.orderCnt }} </n-text> -->
    <shop-order-cnt :order="garmentOrder" :order-item="orderItem" />
    <n-text>, 주문상태: {{ ORDER_STATE[orderItem.state] }} </n-text>
    <n-text v-if="orderItem.amount.paidAt">
      , 결제일: {{ timeToDate(orderItem.amount.paidAt, "MIN") }}
    </n-text>
  </n-space>
</template>
