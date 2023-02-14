<script setup lang="ts">
import {
  IoOrder,
  ORDER_STATE,
  OrderItemCombined,
  VENDOR_GARMENT_DB,
  setItemCnt,
  refreshOrder,
  ORDER_GARMENT_DB,
} from "@/composable";
import { timeToDate } from "@io-boxies/js-lib";
import { computed, toRefs } from "vue";

const props = defineProps<{
  ioOrder: IoOrder;
  orderItem: OrderItemCombined;
  checked: boolean;
}>();
const { ioOrder, checked, orderItem } = toRefs(props);
const emits = defineEmits<{
  (e: "onClick", value: string): void;
}>();
function onClickChecker() {
  if (orderItem.value) emits("onClick", orderItem.value.id);
}

const fillRequired = computed(
  () => orderItem.value.vendorProd.stockCnt < orderItem.value.orderCnt
);
async function fillStock() {
  const fillCount =
    orderItem.value.orderCnt - orderItem.value.vendorProd.stockCnt;
  await VENDOR_GARMENT_DB.incrementStockCnt(
    fillCount,
    orderItem.value.vendorProd.vendorProdId
  );
  orderItem.value.vendorProd.stockCnt += fillCount;
  setItemCnt(
    orderItem.value,
    orderItem.value.orderCnt,
    orderItem.value.vendorProd.stockCnt,
    orderItem.value.vendorProd.allowPending,
    false,
    orderItem.value.prodAmount.paid
  );
  ioOrder.value.items.splice(
    ioOrder.value.items.findIndex((x) => x.id === orderItem.value.id),
    1
  );
  ioOrder.value.items.push(orderItem.value);
  refreshOrder(ioOrder.value);
  await ORDER_GARMENT_DB.updateOrder(ioOrder.value);
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
    <shop-order-cnt :order="ioOrder" :order-item="orderItem" />
    <n-text>, 주문상태: {{ ORDER_STATE[orderItem.state] }} </n-text>
    <n-text v-if="orderItem.prodAmount.paidAt">
      , 결제일: {{ timeToDate(orderItem.prodAmount.paidAt, "MIN") }}
    </n-text>
    <n-button v-if="fillRequired" size="small" type="error" @click="fillStock"
      >재고채우기</n-button
    >
  </n-space>
</template>
