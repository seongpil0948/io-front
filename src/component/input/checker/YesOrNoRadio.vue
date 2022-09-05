<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from "vue";
import { useLogger } from "vue-logger-plugin";

const log = useLogger();
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
onMounted(() => {
  if (
    typeof props.value !== typeof yesVal.value ||
    typeof props.value !== typeof noVal.value
  ) {
    log.error(
      null,
      "yes or no radio compoent의 Model Value 와 yes or no val이 다릅니다.",
      typeof props.value,
      typeof yesVal.value,
      typeof noVal.value
    );
  }
});
const radioModel = ref(props.value === yesVal.value ? "yes" : "no");

watch(
  radioModel,
  (newVal) => {
    if (newVal === "yes") {
      emits("update:value", yesVal.value);
    } else {
      emits("update:value", noVal.value);
    }
  },
  { immediate: false }
);
</script>

<template>
  <n-radio-group v-model:value="radioModel">
    <n-space item-style="margin-right: none;">
      <n-radio-button key="yes" value="yes" :label="yesLabel ?? 'YES'" />
      <n-radio-button key="no" value="no" :label="noLabel ?? 'NO'" />
    </n-space>
  </n-radio-group>
</template>
