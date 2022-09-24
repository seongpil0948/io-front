<script setup lang="ts">
import { IoUser } from "@/composable";
import { toRefs } from "vue";

const props = defineProps<{ worker: IoUser }>();
defineEmits<{ e: "worker:click" }>();
// const emits =
const { worker } = toRefs(props);
</script>
<template>
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
    <uncle-status-icon status="grey" />
    <n-avatar
      round
      size="small"
      :src="worker.userInfo.profileImg"
      fallback-src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
    />
    <n-text> {{ worker.name }} </n-text>
    <!-- <n-text> 155/200 </n-text> -->
  </n-space>
</template>
