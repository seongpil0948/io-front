<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useShopOrderStore } from "@/store";
import { computed } from "vue";
import { getCurrDate } from "@io-boxies/js-lib";
import { useRouter } from "vue-router";

const router = useRouter();
const shopOrderStore = useShopOrderStore();
const { garmentOrders } = storeToRefs(shopOrderStore);

const numOfApprove = computed(
  () => garmentOrders.value.filter((x) => x.state === "BEFORE_PAYMENT").length
);
const numOfNotApprove = computed(
  () =>
    garmentOrders.value.filter((x) =>
      ["BEFORE_ORDER", "BEFORE_APPROVE"].includes(x.state)
    ).length
);
const amountNotPaid = computed(() => {
  return garmentOrders.value
    .map((x) => x.amount)
    .reduce((acc, curr) => {
      const notPaidAmount = curr.paid ? 0 : curr.orderAmount - curr.paidAmount;
      return acc + notPaidAmount;
    }, 0)
    .toLocaleString();
});
const numOfShipping = computed(
  () =>
    garmentOrders.value.filter((x) =>
      [
        "BEFORE_APPROVE_PICKUP",
        "BEFORE_ASSIGN_PICKUP",
        "BEFORE_PICKUP",
        "ONGOING_PICKUP",
        "PICKUP_COMPLETE",
        "BEFORE_SHIP",
        "SHIPPING",
        "SHIPPING_PENDING",
        "SHIPPING_WAIT",
      ].includes(x.state)
    ).length
);
</script>
<template>
  <n-space vertical align="center" item-style="width: 100%">
    <shop-add-order-table :show-sizes="false" :in-states="['BEFORE_ORDER']" />
    <n-grid
      cols="1 s:2 m:2 l:4 xl:4 2xl:4"
      x-gap="24"
      y-gap="12"
      responsive="screen"
      style="margin-bottom: 2%"
    >
      <n-grid-item>
        <n-card
          class="button-card"
          @click="router.push({ name: 'OrderComplete' })"
        >
          <template #header>
            <n-text>승인주문수</n-text>
          </template>
          <template #header-extra>
            <n-text>{{ getCurrDate() }}</n-text>
          </template>
          {{ numOfApprove }}건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card
          class="button-card"
          style="border-color: var(--primary-color)"
          @click="router.push({ name: 'OrderRequire' })"
        >
          <template #header>
            <n-text>미승인주문수</n-text>
          </template>
          {{ numOfNotApprove }}건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card
          class="button-card"
          style="border-color: #70c0e8"
          @click="router.push({ name: 'OrderComplete' })"
        >
          <template #header>
            <n-text style="font-color: #70c0e8"> 미결제금액 </n-text>
          </template>
          {{ amountNotPaid }} 원
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card
          class="button-card"
          style="border-color: #e88080"
          @click="router.push({ name: 'PayHistory' })"
        >
          <template #header>
            <n-text style="font-color: #e88080"> 배송중인수량 </n-text>
          </template>
          {{ numOfShipping }}건
        </n-card>
      </n-grid-item>
    </n-grid>
    <notice-faq-tab />
  </n-space>
</template>
