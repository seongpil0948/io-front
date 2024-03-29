<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useShopOrderStore } from "@/store";
import { computed } from "vue";
import { getCurrDate } from "@io-boxies/js-lib";
import { useRouter } from "vue-router";

const router = useRouter();
const shopOrderStore = useShopOrderStore();
const { orders } = storeToRefs(shopOrderStore);

const numOfApprove = computed(
  () => orders.value.filter((x) => x.states.includes("BEFORE_PAYMENT")).length
);
const numOfNotApprove = computed(
  () =>
    orders.value.filter((x) =>
      x.states.some((y) => ["BEFORE_ORDER", "BEFORE_APPROVE"].includes(y))
    ).length
);
const amountNotPaid = computed(() => {
  return orders.value
    .flatMap((x) => [x.prodAmount, x.shipAmount, x.pickAmount])
    .reduce((acc, curr) => {
      if (!curr) return 0;
      const notPaidAmount = curr.amount - curr.paidAmount;
      return acc + notPaidAmount;
    }, 0)
    .toLocaleString();
});
const numOfShipping = computed(
  () =>
    orders.value.filter((x) =>
      x.states.some((y) =>
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
        ].includes(y)
      )
    ).length
);
</script>
<template>
  <n-space
    data-test="shop-home"
    vertical
    align="center"
    item-style="width: 100%"
  >
    <shop-add-order-table :in-states="['BEFORE_ORDER']" />
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
          @click="() => router.push({ name: 'OrderComplete' })"
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
          @click="() => router.push({ name: 'OrderRequire' })"
        >
          <template #header>
            <n-text>미승인주문수</n-text>
          </template>
          {{ numOfNotApprove }}건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <!-- @click="() => router.push({ name: 'OrderComplete' })" -->
        <n-card class="button-card" style="border-color: #70c0e8">
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
          @click="() => router.push({ name: 'PayHistory' })"
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
