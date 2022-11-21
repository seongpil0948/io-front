<script setup lang="ts">
import { usePickArea } from "@/composable";
import { Locate } from "@io-boxies/js-lib";
import { toRefs } from "vue";

const props = defineProps<{
  pickId: Locate;
}>();
const { pickId } = toRefs(props);
const emits = defineEmits<{
  (e: "update:pickId", value: Locate): void;
}>();
// const { areaOpt, officeOpt } = usePickArea(area);
const { officeOpt } = usePickArea();
// function onUpdateCity() {
//   area.value.alias = null;
//   emits("update:area", area.value);
// }
function onUpdateOffice(val: Locate) {
  emits("update:pickId", val);
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
      :value="pickId"
      filterable
      placeholder="별칭 선택"
      :options="officeOpt"
      @update:value="onUpdateOffice"
    />
  </n-space>
</template>
