<script setup lang="ts">
import { lightTheme, darkTheme } from "naive-ui";
import { computed, onMounted } from "vue";
import { lightThemeOver, darkThemeOver } from "./composable/config";
import { initIoFirebase } from "./plugin/firebase";
import { useAuthStore } from "./store";

const auth = useAuthStore();
const isDark = computed(() => (auth.user ? auth.user.preferDark : false));
const currTheme = computed(() =>
  isDark.value ? darkThemeOver : lightThemeOver
);

onMounted(initIoFirebase);
</script>

<template>
  <n-config-provider
    :theme="isDark ? darkTheme : lightTheme"
    :theme-overrides="currTheme"
  >
    <n-message-provider placement="top-right">
      <n-loading-bar-provider>
        <n-dialog-provider>
          <main-view />
        </n-dialog-provider>
      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss">
@import "./asset/variables.scss";
</style>
