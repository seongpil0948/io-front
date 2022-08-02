<script setup lang="ts">
import { commonTime } from "@/util";
const { currDate } = commonTime();
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
        <n-card>
          <template #header>
            <n-text>승인주문수</n-text>
          </template>
          <template #header-extra>
            <n-text>{{ currDate }}</n-text>
          </template>
          0건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card style="border-color: var(--primary-color)">
          <template #header>
            <n-text>거절주문수</n-text>
          </template>
          0건
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card style="border-color: #70c0e8">
          <template #header>
            <n-text style="font-color: #70c0e8">미결제금액</n-text>
          </template>
          0원
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card style="border-color: #e88080">
          <template #header>
            <n-text style="font-color: #e88080">픽업중인수량</n-text>
          </template>
          0건
        </n-card>
      </n-grid-item>
    </n-grid>
  </n-space>
</template>
