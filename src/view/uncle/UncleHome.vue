<script setup lang="ts">
import { useAuthStore } from "@/store";
import { availUncleAdvertise } from "@io-boxies/js-lib";
const auth = useAuthStore();
const u = auth.currUser();
</script>
<template>
  <n-space vertical align="center" item-style="width: 100%">
    <n-grid
      style="width: 65vw"
      cols="1 s:2 m:2 l:4 xl:4 2xl:4"
      x-gap="24"
      y-gap="12"
      responsive="screen"
    >
      <n-grid-item>
        <n-card class="button-card" style="border-color: #e88080">
          <template #header>
            <n-text style="font-color: #e88080"> 계약 가능 상태 </n-text>
          </template>
          {{ availUncleAdvertise(u) ? "노출" : "미노출" }}
        </n-card>
      </n-grid-item>
    </n-grid>
    <notice-faq-tab />
  </n-space>
</template>
