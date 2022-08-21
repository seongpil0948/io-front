<script setup lang="ts">
import { useAdminArea } from "@/composable";
import { computed, toRefs, watchEffect } from "vue";
export interface Area {
  city: null | string;
  county: null | string;
  town: null | string;
}
const props = defineProps<{
  area: Area;
}>();
const { area } = toRefs(props);
const emits = defineEmits<{
  (e: "update:area", value: Area): void;
}>();
const useArea = useAdminArea();
const cityOpt = computed(() =>
  useArea.cities.value.map((y) => {
    return {
      label: y,
      value: y,
    };
  })
);
const countyOpt = computed(() => {
  const city = area.value.city;
  return city
    ? Object.keys(useArea.areaDict.value[city]).map((x) => {
        return {
          label: x,
          value: x,
        };
      })
    : [];
});
const townOpt = computed(() => {
  const val = area.value;
  if (val.county && val.city) {
    return useArea.areaDict.value[val.city][val.county].map((x) => {
      return {
        label: x,
        value: x,
      };
    });
  } else {
    return [];
  }
});
watchEffect(() => emits("update:area", area.value));
</script>
<template>
  <n-space justify="space-around">
    <n-select
      style="color: yellow"
      filterable
      placeholder="시선택"
      v-model:value="area.city"
      :options="cityOpt"
    />
    <n-select
      filterable
      placeholder="구선택"
      v-model:value="area.county"
      :options="countyOpt"
    />
    <n-select
      filterable
      placeholder="동선택"
      v-model:value="area.town"
      :options="townOpt"
    />
  </n-space>
</template>
