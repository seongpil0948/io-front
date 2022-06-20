<script setup lang="ts">
import { ref, toRefs, watchEffect } from "vue";

const props = defineProps<{
  value: any;
  yesVal: unknown;
  yesLabel?: string;
  noVal: unknown;
  noLabel?: string;
}>();
const { yesVal, noVal } = toRefs(props);
const emits = defineEmits<{
  (e: "update:value", value: typeof yesVal.value | typeof noVal.value): void;
}>();
const radioModel = ref("yes");

watchEffect(() => {
  const newVal = radioModel.value;
  if (newVal === "yes") {
    emits("update:value", yesVal.value);
  } else {
    emits("update:value", noVal.value);
  }
});
</script>

<template>
  <n-radio-group v-model:value="radioModel">
    <n-radio-button
      style="min-width: 20vw"
      key="yes"
      value="yes"
      :label="yesLabel ?? 'YES'"
    />
    <n-radio-button
      style="min-width: 20vw"
      key="no"
      value="no"
      :label="noLabel ?? 'NO'"
    />
  </n-radio-group>
</template>
