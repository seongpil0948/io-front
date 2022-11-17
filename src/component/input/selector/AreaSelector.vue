<script setup lang="ts">
import { useAdminArea } from "@/composable";
import { isMobile } from "@/util";
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
function onUpdateCity() {
  area.value.county = null;
  area.value.town = null;
  emits("update:area", area.value);
}
function onUpdateCounty() {
  area.value.town = null;
  emits("update:area", area.value);
}
</script>
<template>
  <n-space :vertical="isMobile()" justify="space-around" :wrap="false">
    <n-select
      v-model:value="area.city"
      style="color: yellow"
      filterable
      placeholder="시선택"
      :options="cityOpt"
      @update:value="onUpdateCity"
    />
    <n-select
      v-model:value="area.county"
      filterable
      placeholder="구선택"
      :options="countyOpt"
      @update:value="onUpdateCounty"
    />
    <n-select
      v-model:value="area.town"
      filterable
      placeholder="동선택"
      :options="townOpt"
    />
  </n-space>
</template>
