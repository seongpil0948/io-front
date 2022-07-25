<script lang="ts" setup>
const props = defineProps<{ size: string }>();
</script>

<template>
  <img
    src="/logo.png"
    :style="`width: ${props.size}; height: ${props.size}; object-fit: contain; cursor: pointer;`"
  />
</template>
