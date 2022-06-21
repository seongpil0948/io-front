<script setup lang="ts">
import { useAuthStore } from "@/stores";
import { computed, getCurrentInstance, ref, watchEffect } from "vue";

const inst = getCurrentInstance();
const authStore = useAuthStore();
const user = authStore.user;
const selectedOpt = ref<null | string>(null);
const userOpts = computed(() => [
  {
    label: "로그아웃",
    value: "logout",
  },
]);
watchEffect(async () => {
  if (selectedOpt.value === "logout") {
    await authStore.logout();
    await inst?.appContext.config.globalProperties.$kakao.Auth.logout();
  }
});
</script>

<template>
  <n-space inline align="center" class="space-no-mb" style="font-size: 0.8rem">
    <n-space vertical>
      <n-text>{{ user?.name }}</n-text>
      <n-text>{{ user?.showId }}</n-text>
      <n-popselect v-model:value="selectedOpt" :options="userOpts">
        <n-button style="font-size: 0.8rem" text>계정설정 </n-button>
      </n-popselect>
    </n-space>
    <n-badge value="999+">
      <user-avatar />
    </n-badge>
  </n-space>
</template>
