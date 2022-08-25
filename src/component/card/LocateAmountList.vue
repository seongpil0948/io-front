<script setup lang="ts">
import { LocateAmount, LocateCRT } from "@/composable";
import { toRefs } from "vue";

const props = defineProps<{
  locates: LocateAmount[];
}>();
const { locates } = toRefs(props);
const locateKey = [
  ["도시", "city"],
  ["우편번호", "postalCode"],
  ["상세주소", "detailLocate"],
  ["성", "firstName"],
  ["이름", "lastName"],
  ["핸드폰번호", "phone"],
] as [i: string, j: keyof LocateCRT][];
</script>

<template>
  <n-space v-if="locates.length > 0" style="overflow-x: scroll" :wrap="false">
    <n-tooltip trigger="hover" v-for="(i, idx) in locates" :key="idx">
      <template #trigger>
        <n-tag round> {{ i.locate.alias }}</n-tag>
      </template>
      <n-card style="width: 25vw" title="주소지 정보">
        <template #header-extra>
          <n-text>가격(원): {{ i.amount.toLocaleString() }}</n-text>
        </template>
        <n-space v-for="(j, idx2) in locateKey" :key="idx2 + '2'">
          <n-text type="info">{{ j[0] }} </n-text>
          <n-text type="primary">{{ i.locate[j[1]] }} </n-text>
        </n-space>
      </n-card>
    </n-tooltip>
  </n-space>
</template>
