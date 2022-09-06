<script setup lang="ts">
import { CompanyInfo, Locate, LocateCRT } from "@/composable";
import { computed, ref, toRefs } from "vue";

const props = defineProps<{
  info: CompanyInfo;
}>();
const { info } = toRefs(props);
const emits = defineEmits<{
  (e: "update:info", value: CompanyInfo): void;
}>();
const locates = computed(() => info.value.locations ?? []);

const showAppendModal = ref(false);
function onAppendLocate(l: Locate) {
  info.value.locations.push(l);
  emits("update:info", info.value);
  //   await user.update();
}
function onLocateClose(l: Locate) {
  info.value.locations.splice(
    info.value.locations.findIndex((x) => x.alias === l.alias),
    1
  );
  emits("update:info", info.value);
  //   await user.update();
}
function setShipAddr(l: Locate) {
  info.value.shipLocate = l;
  emits("update:info", info.value);
  //   await user.update();
}
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
  <n-space v-if="info" style="overflow-x: scroll" :wrap="false">
    <n-tooltip trigger="hover" v-for="(i, idx) in locates" :key="idx">
      <template #trigger>
        <n-tag round closable @close="onLocateClose(i as Locate)">
          {{ i.alias }}</n-tag
        >
      </template>
      <!-- keyword:  {{ locateStr(i) }} -->
      <n-card style="width: 25vw" title="주소지 정보">
        <template #header-extra>
          <n-button
            v-if="info.shipLocate?.postalCode !== i.postalCode"
            size="small"
            @click="setShipAddr(i as Locate)"
          >
            배송지 선정
          </n-button>
        </template>
        <n-space v-for="(j, idx2) in locateKey" :key="idx2 + '2'">
          <n-text type="info">{{ j[0] }} </n-text>
          <n-text type="primary">{{ i[j[1]] }} </n-text>
        </n-space>
      </n-card>
    </n-tooltip>
    <div style="width: 5px"></div>
    <n-button @click="showAppendModal = true">추가 </n-button>
    <locate-append-modal
      @appendLocate="onAppendLocate"
      v-model:showAppendModal="showAppendModal"
    />
  </n-space>
</template>
