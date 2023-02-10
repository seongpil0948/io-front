<script setup lang="ts">
import { inWork } from "@io-boxies/js-lib";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUncleOrderStore } from "@/store";

const rightCollapsed = ref(false);
const width = 320;
const uncleStore = useUncleOrderStore();
const { workers } = storeToRefs(uncleStore);
const statusCnts = ref({
  inWork: 0,
  leave: 0,
});
function initCnts() {
  statusCnts.value.inWork = 0;
  statusCnts.value.leave = 0;
}
watch(
  () => workers.value,
  (val) => {
    initCnts();
    for (let i = 0; i < val.length; i++) {
      const w = val[i];
      if (inWork(w)) {
        statusCnts.value.inWork += 1;
      } else {
        statusCnts.value.leave += 1;
      }
    }
  },
  { deep: true }
);
</script>
<template>
  <n-layout-sider
    v-model:collapsed="rightCollapsed"
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="10"
    :width="width"
    :native-scrollbar="false"
    style="z-index: 0; margin-left: 3px"
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
        <n-h2> 팀 엉클 </n-h2> <n-button text> 팀 설정 </n-button>
      </n-space>
      <!-- TODO -->
      <n-text>인원: 100 </n-text>
      <n-space size="large" justify="space-between">
        <uncle-status-count
          status="green"
          text="업무중"
          :count="statusCnts.inWork"
        />
        <uncle-status-count
          status="grey"
          text="퇴근"
          :count="statusCnts.leave"
        />
      </n-space>
      <n-divider />
      <!-- <n-h2>디오트</n-h2> -->
      <uncle-status-row
        v-for="(worker, i) in workers"
        :key="i"
        :style="`width: ${width * 0.8}px;`"
        :worker="worker"
      />
    </n-space>
  </n-layout-sider>
</template>
