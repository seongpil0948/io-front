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
    size="large"
    inline
    style="
      border-radius: 22px;
      background-color: dimgrey;
      width: 133%;
      padding: 3%;
      font-size: 1rem;
      align-items: center;
      cursor: pointer;
    "
    justify="space-around"
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
