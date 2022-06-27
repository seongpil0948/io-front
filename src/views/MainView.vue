<script setup lang="ts">
import { notAuthName } from "@/plugins/router";
import { useRouter } from "vue-router";

const router = useRouter();
</script>
<template>
  <router-view></router-view>
  <n-layout-footer
    bordered
    position="absolute"
    style="
      height: 64px;
      padding: 24px;
      border: none;
      background-color: transparent;
      font-size: smaller;
    "
  >
    <n-text depth="3">
      인아웃박스(inoutbox) | 대표: 송준회 | 주소: 서울 강남구 테헤란로 6길 16,
      1동 13층 1호
      <br />
      사업자등록번호: 720-08-02296 | 문의: inoutboxofficial@gmail.com
    </n-text>
  </n-layout-footer>
  <float-action-button
    v-if="
      !notAuthName.includes(router.currentRoute.value.name?.toString() ?? '')
    "
  />
</template>
