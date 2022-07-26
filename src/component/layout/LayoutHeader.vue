<script lang="ts" setup>
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";
const authStore = useAuthStore();
const router = useRouter();
</script>

<template>
  <n-layout-header bordered>
    <n-space justify="space-between" style="margin: 0% 2.5%">
      <n-space style="align-items: center" inline>
        <logo-image @click="router.goHome(authStore.currUser)" size="3.5rem" />
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
