<script setup lang="ts">
import { lightTheme, darkTheme } from "naive-ui";
import { computed } from "vue";
import { lightThemeOver, darkThemeOver } from "./composable/config";
import { useAuthStore } from "./store";

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

body {
  width: 100vw;
  height: 100vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  height: 100%;
}
.space-no-mb * {
  margin-bottom: 0px !important;
}

.n-message--error-type {
  border: 1px solid $io-red;
  box-shadow: 0px 1px 7px 0px $io-red;
}

.n-divider:not(.n-divider--vertical) {
  margin-top: 12px;
  margin-bottom: 12px;
}
.n-card-header {
  overflow: auto;
}
.button-card {
  cursor: pointer;
  transition: 0.5s;
}
.button-card:hover {
  transform: scale(1.05);
}
</style>
