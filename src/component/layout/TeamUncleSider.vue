<script setup lang="ts">
import { useUncleWorkers } from "@/composable";
import { ref } from "vue";

const rightCollapsed = ref(false);
const width = 360;
const { workers } = useUncleWorkers();
</script>
<template>
  <n-layout-sider
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :width="width"
    :native-scrollbar="false"
    v-model:collapsed="rightCollapsed"
    style="z-index: 0"
  >
    <n-space
      v-if="!rightCollapsed"
      size="large"
      vertical
      align="start"
      style="width: 100%; padding-top: 2vh; padding-left: 1vw; overflow-y: auto"
    >
      <n-space
        inline
        justify="space-between"
        :style="`width: ${width * 0.8}px;`"
      >
        <n-h2> 팀 엉클 </n-h2> <n-button text>팀 설정</n-button>
      </n-space>
      <n-text>인원: 100 </n-text>
      <n-space size="large" justify="space-between">
        <uncle-status-count status="green" text="업무중" :count="10" />
        <uncle-status-count status="grey" text="퇴근" :count="40" />
      </n-space>
      <n-divider />
      <!-- <n-h2>디오트</n-h2> -->
      <uncle-status-row
        :style="`width: ${width * 0.8}px;`"
        v-for="(worker, i) in workers"
        :key="i"
        :worker="worker"
      />
    </n-space>
  </n-layout-sider>
</template>
