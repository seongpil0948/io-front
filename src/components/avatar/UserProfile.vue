<script setup lang="ts">
import { useAuthStore } from "@/stores";

const authStore = useAuthStore();
const user = authStore.user;
</script>

<template>
  <n-space inline align="center" class="space-no-mb" style="font-size: 0.8rem">
    <n-space vertical>
      <n-text>{{ user?.name }}</n-text>
      <n-text>{{ user?.showId }}</n-text>
      <n-button text> <div style="font-size: 0.8rem">계정설정</div> </n-button>
    </n-space>
    <n-badge value="999+">
      <user-avatar />
    </n-badge>
  </n-space>
</template>
