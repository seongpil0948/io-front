<script setup lang="ts">
import { usePickArea } from "@/composable";
import { Locate } from "@io-boxies/js-lib";
import { toRefs, onBeforeUnmount } from "vue";

const props = defineProps<{
  pickId: Locate;
}>();
const { pickId } = toRefs(props);
const emits = defineEmits<{
  (e: "update:pickId", value: Locate): void;
}>();
const { officeOpt, unsubscribe } = usePickArea();
onBeforeUnmount(() => unsubscribe());
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
