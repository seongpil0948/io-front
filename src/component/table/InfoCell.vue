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
  <v-space vertical>
    <n-text style="font-size: x-large" v-if="first" type="primary" depth="1">{{
      first
    }}</n-text>
    <n-text style="font-size: small" v-if="second" type="primary" depth="3">{{
      second
    }}</n-text>
    <n-text style="font-size: x-large" v-if="third" type="primary" depth="2">{{
      third
    }}</n-text>
  </v-space>
</template>
