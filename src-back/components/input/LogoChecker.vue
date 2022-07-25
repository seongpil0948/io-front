<script setup lang="ts">
import { toRefs } from "vue";
const props = defineProps<{
  checked: boolean;
  size?: number;
}>();
const { checked, size = 3 } = toRefs(props);
</script>

<template>
  <n-tooltip placement="top-start" trigger="hover">
    <template #trigger>
      <div :style="`width: ${size}rem; height: ${size}rem; cursor: pointer;`">
        <img
          :style="` width: 150%; height: 150%`"
          v-if="checked"
          src="/logo.png"
        />
        <div
          v-else
          :style="`border: 1px solid; width: 100%; height: 100%`"
        ></div>
      </div>
    </template>
    체크박스에 체크가 되면, 미송을 받습니다.
    <br />
    체크가 안 되어 있으면, 미송을 받지 않습니다.
  </n-tooltip>
</template>
