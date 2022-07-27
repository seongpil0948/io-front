<script setup lang="ts">
import { ref } from "vue";

const currTab = ref<string>("reqOrderList");
</script>
<template>
  <n-space vertical align="center">
    <n-card>
      <n-tabs v-model:value="currTab">
        <n-tab-pane tab="실시간 픽업 현황" name="pickStatus"> gg </n-tab-pane>
        <n-tab-pane tab="통계" name="statistics"> gg </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
