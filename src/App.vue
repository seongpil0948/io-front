<script setup lang="ts">
import type { GlobalThemeOverrides } from "naive-ui";
import { getCurrentInstance } from "vue";
import { ioColors } from "./composables";

const app = getCurrentInstance();
console.log("VUE APP INSTANCE: ", app);

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
    placeholderColor: ioColors.text,
    iconColor: ioColors.text,
    hoverColor: ioColors.primary,
    bodyColor: ioColors.background,
    fontWeightStrong: "700",
  },
  Input: {
    color: ioColors.primary,
  },
  Layout: {
    color: ioColors.background,
    headerColor: ioColors.primary,
  },
  Button: {
    color: ioColors.white,
    colorHover: ioColors.primary,
    textColorHover: ioColors.white,
    colorPrimary: ioColors.primary,
    colorTertiary: ioColors.white,
    textColor: ioColors.text,
    textColorGhostPrimary: ioColors.text,
    textColorFocus: ioColors.text,
    textColorTertiary: ioColors.text,
    textColorPrimary: ioColors.text,
    textColorFocusInfo: ioColors.text,
    textColorInfo: ioColors.text,
    textColorSuccess: ioColors.text,
  },
  Radio: {
    dotColorActive: ioColors.primary,
    color: ioColors.white,
    buttonTextColorActive: ioColors.white,
  },
  Checkbox: {
    textColor: ioColors.text,
    color: ioColors.white,
    checkMarkColor: ioColors.text,
    colorChecked: ioColors.white,
  },
  Select: {
    peers: {
      InternalSelectMenu: {
        actionTextColor: ioColors.text,
        optionTextColor: ioColors.text,
        optionTextColorActive: ioColors.text,
      },
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
    tabTextColorActiveSegment: ioColors.black,
    tabTextColorActiveBar: ioColors.black,
    tabTextColorActiveCard: ioColors.black,
    tabTextColorSegment: ioColors.black,
    tabTextColorCard: ioColors.black,
    tabTextColorBar: ioColors.black,
    tabTextColorHoverBar: ioColors.white,
    tabTextColorHoverSegment: ioColors.white,
    tabTextColorHoverCard: ioColors.white,
  },
  Dialog: {
    textColor: ioColors.text,
    iconColorSuccess: ioColors.text,
  },
  Popover: {
    dividerColor: ioColors.primary,
  },
  Tooltip: {
    color: ioColors.white,
    textColor: ioColors.black,
    boxShadow: ioColors.primary,
    borderRadius: "10px",
  },
};
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
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
.io-bacground {
  background: $io-background;
}

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

.n-tabs .n-tabs-tab {
  min-width: 4vw;
}
.n-tabs .n-tabs-bar {
  top: 2px !important;
  height: 4px;
  border-radius: 12px;
  max-width: 10rem;
}
.n-tabs--bar-type div.n-tabs-tab {
  background-color: $io-primary;
  border-radius: 25px;
  margin-right: 2vw;
  padding: 0.8rem 2rem !important;
}

.n-tabs--bar-type .n-tabs-tab.n-tabs-tab--active {
  background-color: white;
}
.n-message--error-type {
  border: 1px solid $io-red;
  box-shadow: 0px 1px 7px 0px $io-red;
}

.n-divider:not(.n-divider--vertical) {
  margin-top: 12px;
  margin-bottom: 12px;
}
.n-tooltip {
  border: $io-primary solid 0.3rem;
}
</style>
