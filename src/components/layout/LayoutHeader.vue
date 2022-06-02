<script lang="ts" setup>
import { useAuthStore } from "@/stores";
import { useRouter } from "vue-router";
const authStore = useAuthStore();
const router = useRouter();
</script>

<template>
  <n-layout-header bordered>
    <n-space justify="space-between" style="margin: 0% 2.5%">
      <n-space style="align-items: center" inline>
        <logo-image size="3.5rem" />
      </n-space>
      <n-space inline>
        <n-button @click="() => router.push({ name: 'VendorHome' })"
          >도매처모드</n-button
        ><n-button @click="() => router.push({ name: 'ShopHome' })"
          >쇼핑몰모드</n-button
        >
        <n-button @click="() => router.push({ name: 'UncleHome' })"
          >사입삼춘모드</n-button
        >
        <n-button @click="() => authStore.logout()">로그아웃</n-button>
      </n-space>
      <user-profile />
    </n-space>
  </n-layout-header>
</template>

<style scoped>
.n-h {
  margin: 0px;
  align-items: center;
  display: flex;
  height: 100%;
}
</style>
