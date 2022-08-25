<script setup lang="ts">
import { ref } from "vue";

const currTab = ref<string>("BEFORE_APPROVE_PICKUP");
</script>
<template>
  <n-space vertical align="center">
    <n-card style="width: 80vw">
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          display-directive="show:lazy"
          tab="픽업 요청"
          name="BEFORE_APPROVE_PICKUP"
        >
          <!-- <order-by-shop-expand-table :inStates="['BEFORE_APPROVE_PICKUP']" /> -->
          <n-h1>픽업요청탭</n-h1>
        </n-tab-pane>
      </n-tabs></n-card
    >
  </n-space>
</template>
