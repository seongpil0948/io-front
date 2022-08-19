<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore, useShopOrderStore } from "@/store";
import { commonTime } from "@/util";
import { computed, onBeforeMount } from "vue";
const { currDate } = commonTime();
const auth = useAuthStore();
const user = auth.currUser;

const shopOrderStore = useShopOrderStore();
onBeforeMount(() => shopOrderStore.init(user.userInfo.userId));
const { garmentOrders } = storeToRefs(shopOrderStore);

const numOfApprove = computed(
  () =>
    garmentOrders.value.filter(
      (x) => !["BEFORE_ORDER", "BEFORE_APPROVE"].includes(x.state)
    ).length
);
const numOfNotApprove = computed(
  () =>
    garmentOrders.value.filter((x) =>
      ["BEFORE_ORDER", "BEFORE_APPROVE"].includes(x.state)
    ).length
);
const amountNotPaid = computed(() => {
  return garmentOrders.value
    .map((x) => x.actualAmount)
    .reduce((acc, curr) => {
      const notPaidAmount = curr.orderAmount - curr.paidAmount;
      return acc + notPaidAmount;
    }, 0)
    .toLocaleString();
});
const numOfShipping = computed(
  () => garmentOrders.value.filter((x) => ["SHIPPING"].includes(x.state)).length
);
</script>
<template>
  <n-space vertical align="center">
    <shop-add-order-table
      style="width: 65vw"
      :showSizes="false"
      :inStates="['BEFORE_ORDER']"
    />
    <n-grid
      style="width: 65vw"
      cols="1 s:2 m:2 l:4 xl:4 2xl:4"
      x-gap="24"
      y-gap="12"
      responsive="screen"
    >
      <n-grid-item>
        <n-card class="button-card">
          <template #header>
            <n-text>승인주문수</n-text>
          </template>
          <template #header-extra>
            <n-text>{{ currDate }}</n-text>
          </template>
          {{ numOfApprove }}건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="button-card" style="border-color: var(--primary-color)">
          <template #header>
            <n-text>미승인주문수</n-text>
          </template>
          {{ numOfNotApprove }}건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="button-card" style="border-color: #70c0e8">
          <template #header>
            <n-text style="font-color: #70c0e8">미결제금액</n-text>
          </template>
          {{ amountNotPaid }} 원
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="button-card" style="border-color: #e88080">
          <template #header>
            <n-text style="font-color: #e88080">픽업중인수량</n-text>
          </template>
          {{ numOfShipping }}건
        </n-card>
      </n-grid-item>
    </n-grid>
  </n-space>
</template>
