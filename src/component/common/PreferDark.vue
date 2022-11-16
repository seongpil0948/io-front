<script setup lang="ts">
import { useAuthStore } from "@/store";
import { DarkModeOutlined } from "@vicons/material";

const auth = useAuthStore();

defineProps<{ text: boolean }>();
async function changeDark(val: boolean) {
  if (auth.user) {
    auth.user.preferDark = val;
    await auth.user.update();
  }
}
</script>

<template>
  <n-space justify="space-around">
    <n-text v-if="text"> 다크모드 </n-text>
    <n-switch
      v-if="auth.user"
      v-model:value="auth.user.preferDark"
      size="medium"
      @update:value="changeDark"
    >
      <template #icon>
        <DarkModeOutlined />
      </template>
    </n-switch>
  </n-space>
</template>
