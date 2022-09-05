<script setup lang="ts">
import { useAuthStore } from "@/store";
import { useVendorOrderStore } from "@/store/vendorOrder";
import { commonTime } from "@/util";
import { onBeforeMount, ref } from "vue";
const currTab = ref<string>("BEFORE_APPROVE");
const { currDate } = commonTime();

const auth = useAuthStore();
const user = auth.currUser;
const store = useVendorOrderStore();
onBeforeMount(() => store.init(user.userInfo.userId));
</script>
<template>
  <n-space vertical align="center">
    <n-card style="width: 65vw">
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          display-directive="show:lazy"
          tab="거래처 주문 요청"
          name="BEFORE_APPROVE"
        >
          <order-by-shop-expand-table :inStates="['BEFORE_APPROVE']" />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="승인 완료된 주문"
          name="BEFORE_PAYMENT"
        >
          <order-by-shop-expand-table
            :inStates="[
              'BEFORE_PAYMENT',
              'BEFORE_PICKUP_REQ',
              'BEFORE_ASSIGN_PICKUP',
              'BEFORE_PICKUP',
              'PICKUP_COMPLETE',
              'BEFORE_SHIP',
              'SHIPPING',
              'SHIPPING_COMPLETE',
            ]"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
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
            <n-text>요청주문수</n-text>
          </template>
          <template #header-extra>
            <n-text>{{ currDate }}</n-text>
          </template>
          0건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="button-card" style="border-color: var(--primary-color)">
          <template #header>
            <n-text>수정/취소 주문수</n-text>
          </template>
          0건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="button-card" style="border-color: #70c0e8">
          <template #header>
            <n-text style="font-color: #70c0e8">미결제금액</n-text>
          </template>
          0 원
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="button-card" style="border-color: #e88080">
          <template #header>
            <n-text style="font-color: #e88080">매장 주문받기</n-text>
          </template>
          <n-text style="font-color: #e88080">바로가기</n-text>
        </n-card>
      </n-grid-item>
    </n-grid>
  </n-space>
</template>
