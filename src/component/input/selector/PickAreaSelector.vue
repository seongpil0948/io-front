<script setup lang="ts">
import { Locate } from "@io-boxies/js-lib";
import { toRefs } from "vue";

const props = defineProps<{
  pickId: Locate;
  officeOpt: {
    label: string;
    value: string;
  }[];
}>();
const { pickId, officeOpt } = toRefs(props);
const emits = defineEmits<{
  (e: "update:pickId", value: Locate): void;
}>();
function onUpdateOffice(val: Locate) {
  emits("update:pickId", val);
}
</script>
<template>
  <n-space justify="space-around">
    <n-select
      :value="pickId"
      filterable
      placeholder="별칭 선택"
      :options="officeOpt"
      @update:value="onUpdateOffice"
    />
  </n-space>
</template>
