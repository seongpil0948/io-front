<script setup lang="ts">
import type { GlobalThemeOverrides } from "naive-ui";
import { ioColors } from "./composables";

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: ioColors.primary,
    primaryColorHover: ioColors.primary,
    primaryColorPressed: ioColors.primary,
    primaryColorSuppl: ioColors.primary,
    infoColor: ioColors.primary,
    infoColorHover: ioColors.primary,
    infoColorPressed: ioColors.primary,
    infoColorSuppl: ioColors.primary,
    successColor: ioColors.primary,
    successColorHover: ioColors.primary,
    successColorPressed: ioColors.primary,
    successColorSuppl: ioColors.primary,
    baseColor: ioColors.primary,
    textColorBase: ioColors.text,
    textColor1: ioColors.text,
    textColor2: ioColors.text,
    textColor3: ioColors.text,
    placeholderColor: ioColors.text,
    iconColor: ioColors.text,
    hoverColor: ioColors.primary,
    bodyColor: ioColors.background,
  },
  Input: {
    color: ioColors.primary,
  },
  Layout: {
    color: ioColors.background,
    headerColor: ioColors.primary,
  },
  Button: {
    color: ioColors.primary,
    textColor: ioColors.text,
    textColorFocus: ioColors.primary,
    textColorFocusInfo: ioColors.text,
  },
  Select: {
    peers: {
      InternalSelection: {
        color: ioColors.primary,
        textColor: ioColors.text,
        textColorDisabled: ioColors.text,
      },
    },
  },
  Carousel: {
    arrowColor: ioColors.primary,
  },
  Tabs: {
    barColor: ioColors.black,
    tabColor: ioColors.primary,
  },
};
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-loading-bar-provider>
        <n-dialog-provider>
          <main-view />
        </n-dialog-provider>
      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
body {
  width: 100vw;
  height: 100vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
.space-no-mb * {
  margin-bottom: 0px !important;
}
</style>
