<script setup lang="ts">
// import { onRenderTracked, onRenderTriggered } from "vue";
import { useNaiveConfig } from "./composable/config";
import { darkTheme, lightTheme } from "naive-ui";

const { isDark, currTheme, naiveLocate } = useNaiveConfig();

// onRenderTracked((event) => {
//   console.log("on App RenderTracked: ", event);
// });

// onRenderTriggered((event) => {
//   console.log("on App RenderTriggered: ", event);
// });
</script>

<template>
  <n-config-provider
    :theme="isDark ? darkTheme : lightTheme"
    :theme-overrides="currTheme"
    :locale="naiveLocate.naiveLocale"
    :date-locale="naiveLocate.naiveDate"
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
