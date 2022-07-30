<script setup lang="ts">
import { lightTheme } from "./constants";
</script>

<template>
  <n-config-provider :theme-overrides="lightTheme">
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
.n-tooltip,
// .n-popover {
//   border: $io-primary solid 0.3rem;
// }
.n-tabs .n-tab-pane {
  justify-content: center;
  display: flex;
}
.n-card-header {
  overflow: scroll;
}
</style>
