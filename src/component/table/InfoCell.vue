<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps<{
  first: string;
  second: string;
  third: string;
}>();
const { first, second, third } = toRefs(props);
</script>

<template>
  <n-space vertical>
    <n-text style="font-size: large" v-if="first" type="primary" depth="1">{{
      first
    }}</n-text>
    <n-text style="font-size: small" v-if="second" type="primary" depth="3">{{
      second
    }}</n-text>
    <n-text style="font-size: large" v-if="third" type="primary" depth="2">{{
      third
    }}</n-text>
  </n-space>
</template>
