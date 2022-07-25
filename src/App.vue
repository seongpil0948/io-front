<script setup lang="ts">
import { lightTheme } from "./constants";
import MainView from "./view/MainView.vue";
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
