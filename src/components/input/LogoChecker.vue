<script setup lang="ts">
import { toRefs } from "vue";
const props = defineProps<{
  checked: boolean;
  size?: number;
}>();
const { checked, size = 3 } = toRefs(props);
</script>

<template>
  <div :style="`width: ${size}rem; height: ${size}rem; cursor: pointer;`">
    <img :style="` width: 150%; height: 150%`" v-if="checked" src="/logo.png" />
    <div v-else :style="`border: 1px solid; width: 100%; height: 100%`"></div>
  </div>
</template>
