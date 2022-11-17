<script setup lang="ts">
import { useAuthStore } from "@/store";
import { USER_DB } from "@io-boxies/js-lib";
import { DarkModeOutlined } from "@vicons/material";

const auth = useAuthStore();

defineProps<{ text: boolean }>();
async function changeDark(val: boolean) {
  if (auth.user) {
    auth.user.preferDark = val;
    await USER_DB.updateUser(auth.user);
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
