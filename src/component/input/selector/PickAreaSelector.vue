<script setup lang="ts">
import { CA, usePickArea } from "@/composable";
import { toRefs } from "vue";

const props = defineProps<{
  area: CA;
}>();
const { area } = toRefs(props);
const emits = defineEmits<{
  (e: "update:area", value: CA): void;
}>();
// const { areaOpt, officeOpt } = usePickArea(area);
const { officeOpt } = usePickArea(area);
// function onUpdateCity() {
//   area.value.alias = null;
//   emits("update:area", area.value);
// }
function onUpdateOffice() {
  emits("update:area", area.value);
}
</script>
<template>
  <n-space justify="space-around">
    <!-- <n-select
      style="color: yellow"
      filterable
      placeholder="지역 선택"
      @update:value="onUpdateCity"
      v-model:value="area.code"
      :options="areaOpt"
    /> -->
    <n-select
      filterable
      placeholder="별칭 선택"
      v-model:value="area.alias"
      @update:value="onUpdateOffice"
      :options="officeOpt"
    />
  </n-space>
</template>
