<script setup lang="ts">
import { lightTheme, darkTheme } from "naive-ui";
import { computed, onRenderTracked, onRenderTriggered } from "vue";
import { lightThemeOver, darkThemeOver } from "./composable/config";
import { useAuthStore } from "./store";

onRenderTracked((event) => {
  console.log("on App RenderTracked: ", event);
});

onRenderTriggered((event) => {
  console.log("on App RenderTriggered: ", event);
});

const auth = useAuthStore();
const isDark = computed(() => (auth.user ? auth.user.preferDark : false));
const currTheme = computed(() =>
  isDark.value ? darkThemeOver : lightThemeOver
);
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
