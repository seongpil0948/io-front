<script setup lang="ts">
import { PART, CATEGORIES, GENDOR } from "@/types";
import { toRefs } from "vue";
const props = defineProps<{
  selectedPart: PART | null;
  selectedCtgr: string | null;
}>();
const { selectedPart, selectedCtgr } = toRefs(props);
const emits = defineEmits(["update:selectedPart", "update:selectedCtgr"]);
</script>
<template>
  <n-card content-style="padding: 5px 10px; border-radius: 10px;">
    <n-tabs type="segment" style="min-width: 100%">
      <n-tab-pane
        :name="GENDOR.UNISEX"
        tab="공용"
        style="max-height: 500px; overflow-y: auto"
      >
        <n-space>
          <n-list>
            <n-list-item v-for="(part, i) in Object.keys(PART)" :key="i">
              <n-button
                text
                round
                @click="emits('update:selectedPart', part)"
                >{{ part }}</n-button
              >
            </n-list-item>
          </n-list>
          <n-list v-if="selectedPart">
            <n-list-item
              v-for="(ctgr, i) in Object.keys(CATEGORIES[selectedPart] ?? {})"
              :key="i"
            >
              <n-button text round @click="emits('update:selectedCtgr', ctgr)">
                {{ selectedCtgr ?? ctgr }}</n-button
              >
            </n-list-item>
          </n-list>
        </n-space>
      </n-tab-pane>
      <n-tab-pane :name="GENDOR.FEMALE" tab="여성"></n-tab-pane>
      <n-tab-pane :name="GENDOR.MALE" tab="남성"></n-tab-pane>
    </n-tabs>
  </n-card>
</template>
