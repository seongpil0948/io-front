<script setup lang="ts">
import { inWork } from "@io-boxies/js-lib";
import { IoUser, getUserName } from "@/composable";
import { toRefs } from "vue";

const props = defineProps<{ worker: IoUser }>();
defineEmits<{ e: "worker:click" }>();
// const emits =
const { worker } = toRefs(props);
</script>
<template>
  <!-- eslint-disable vue/require-explicit-emits -->
  <n-space
    inline
    align="center"
    style="
      border-radius: 22px;
      background-color: dimgrey;
      padding: 3%;
      width: 100%;
      align-items: center;
      font-size: 1rem;
      cursor: pointer;
      gap: 10%;
    "
    @click="$emit('worker:click')"
  >
    <uncle-status-icon :status="inWork(worker) ? 'green' : 'grey'" />
    <n-avatar
      round
      size="small"
      :src="worker.userInfo.profileImg"
      fallback-src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
    />
    <n-text> {{ getUserName(worker) }} </n-text>
    <!-- <n-text> 155/200 </n-text> -->
  </n-space>
</template>
