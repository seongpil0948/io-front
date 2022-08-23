<script setup lang="ts">
import { usePickArea } from "@/composable";
import { toRefs } from "vue";
export interface Area {
  city: null | string;
  alias: null | string;
}
const props = defineProps<{
  area: Area;
}>();
const { area } = toRefs(props);
const emits = defineEmits<{
  (e: "update:area", value: Area): void;
}>();
const { areaOpt, officeOpt } = usePickArea();
function onUpdateCity() {
  area.value.alias = null;
  emits("update:area", area.value);
}
function onUpdateOffice() {
  emits("update:area", area.value);
}
</script>
<template>
  <n-space justify="space-around">
    <n-select
      style="color: yellow"
      filterable
      placeholder="시선택"
      @update:value="onUpdateCity"
      v-model:value="area.city"
      :options="areaOpt"
    />
    <n-select
      filterable
      placeholder="구선택"
      v-model:value="area.alias"
      @update:value="onUpdateOffice"
      :options="officeOpt"
    />
  </n-space>
</template>
