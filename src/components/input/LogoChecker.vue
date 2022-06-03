<script setup lang="ts">
import { toRefs } from "vue";
const props = defineProps<{
  checked: boolean;
}>();
const { checked } = toRefs(props);
</script>

<template>
  <div class="check-icon">
    <img class="checked-icon" v-if="checked" src="/logo.png" />
    <div
      v-else
      class="check-icon"
      style="border: 1px solid black; width: 100%; height: 100%"
    ></div>
  </div>
</template>

<style scoped>
.checked-icon {
  width: 3rem;
  height: 3rem;
}
.check-icon {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
