<script setup lang="ts">
import { PART, CATEGORIES, GENDOR } from "@/types";
import { computed, toRefs } from "vue";
const props = defineProps<{
  selectedPart: PART | null;
  selectedCtgr: string | null;
}>();
const { selectedPart, selectedCtgr } = toRefs(props);
const emits = defineEmits(["update:selectedPart", "update:selectedCtgr"]);
const categories = computed(() => {
  if (!selectedPart.value) return [];
  const ctgrs = Object.keys(CATEGORIES[selectedPart.value] ?? {});
  return ctgrs.length > 0 ? [...ctgrs, "전체"] : [];
});
</script>
<template>
  <n-card>
    <n-tabs type="segment" style="min-width: 100%">
      <n-tab-pane :name="GENDOR.UNISEX" tab="공용" class="tab-content">
        <n-space>
          <n-list class="scroll-area">
            <n-list-item
              v-for="(part, i) in ['전체', ...Object.keys(PART)]"
              :key="i"
            >
              <n-button
                :type="selectedPart === part ? 'primary' : 'default'"
                text
                round
                @click="emits('update:selectedPart', part)"
                >{{ part }}</n-button
              >
            </n-list-item>
          </n-list>
          <n-list v-if="selectedPart" class="scroll-area">
            <n-list-item v-for="(ctgr, i) in categories" :key="i">
              <n-button
                :type="selectedCtgr === ctgr ? 'primary' : 'default'"
                text
                round
                @click="emits('update:selectedCtgr', ctgr)"
              >
                {{ ctgr }}</n-button
              >
            </n-list-item>
          </n-list>
        </n-space>
      </n-tab-pane>
      <n-tab-pane
        class="tab-content"
        :name="GENDOR.FEMALE"
        tab="여성"
      ></n-tab-pane>
      <n-tab-pane
        class="tab-content"
        :name="GENDOR.MALE"
        tab="남성"
      ></n-tab-pane>
    </n-tabs>
  </n-card>
</template>
<style>
.tab-content {
  padding: 5px 10px;
  border-radius: 10px;
}
.scroll-area {
  max-height: 15vh;
  overflow: auto;
}
</style>
