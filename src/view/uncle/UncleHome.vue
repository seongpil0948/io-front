<script setup lang="ts">
import { useAuthStore } from "@/store";

const auth = useAuthStore();
const u = auth.currUser;
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
            <n-text style="font-color: #e88080">광고 노출 상태</n-text>
          </template>
          {{ u.availUncleAdvertise ? "활성화" : "비활성화" }}
        </n-card>
      </n-grid-item>
    </n-grid>
    <notice-faq-tab />
  </n-space>
</template>
