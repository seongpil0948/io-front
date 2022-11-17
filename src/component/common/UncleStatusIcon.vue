<script setup lang="ts">
import { Exclamation } from "@vicons/fa";
import { toRefs, ref, watchEffect } from "vue";

const props = defineProps<{
  status: "green" | "error" | "exclamation" | "grey";
}>();
const { status } = toRefs(props);
const statusColor = ref("darkgrey");

watchEffect(() => {
  switch (status.value) {
    case "green":
      statusColor.value = "greenyellow";
      break;
    case "error":
      statusColor.value = "red";
      break;
    case "exclamation":
      statusColor.value = "red";
      break;
    case "grey":
      statusColor.value = "darkgrey";
      break;
  }
});
</script>
<template>
  <n-icon
    v-if="status === 'exclamation'"
    :color="statusColor"
    :size="12"
    :component="Exclamation"
  />
  <span v-else class="dot" :style="`background-color: ${statusColor}`" />
</template>

<style scoped>
.dot {
  height: 0.7rem;
  width: 0.7rem;
  border-radius: 50%;
  display: inline-block;
}
</style>
