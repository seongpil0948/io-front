<script setup lang="ts">
import { ref } from "vue";

const rightCollapsed = ref(false);
const minHeight = "100vh";
</script>
<template>
  <n-layout-sider
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :width="360"
    :native-scrollbar="false"
    v-model:collapsed="rightCollapsed"
    :style="`min-height: ${minHeight}; height: 100%;`"
  >
    <n-space
      v-if="!rightCollapsed"
      size="large"
      vertical
      align="start"
      style="
        padding-top: 2vh;
        padding-left: 1vw;
        overflow-y: scroll;
        max-height: 90vh;
      "
    >
      <n-space inline justify="space-between" style="width: 150%">
        <n-h2> 팀 엉클 </n-h2> <n-button text>팀 설정</n-button>
      </n-space>
      <n-text>인원: 100 </n-text>
      <n-space size="large" justify="space-between" style="width: 90%">
        <uncle-status-count status="green" text="활동" :count="10" />
        <uncle-status-count status="error" text="픽업종료" :count="20" />
        <uncle-status-count status="exclamation" text="토스" :count="10" />
        <uncle-status-count status="grey" text="퇴근" :count="40" />
      </n-space>
      <n-divider />
      <n-h2>디오트</n-h2>
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <n-divider />
      <n-h2>청평화</n-h2>
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <n-h2>디오트</n-h2>
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <n-divider />
      <n-h2>청평화</n-h2>
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <n-h2>디오트</n-h2>
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <n-divider />
      <n-h2>청평화</n-h2>
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
      <uncle-status-row />
    </n-space>
  </n-layout-sider>
</template>
