<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps<{
  status: "green" | "error" | "exclamation" | "grey";
  text: string;
  count: number;
}>();
const { status, count, text } = toRefs(props);
</script>
<template>
  <n-space inline justify="space-around">
    <uncle-status-icon :status="status" />
    <n-text>{{ text }}: </n-text>
    <n-text>{{ count }} </n-text>
  </n-space>
</template>
