<script setup lang="ts">
import { CompanyInfo, Locate } from "@io-boxies/js-lib";
import { computed, ref, toRefs } from "vue";

const props = defineProps<{
  info: CompanyInfo;
  readonly?: boolean;
}>();
const { info, readonly } = toRefs(props);
const emits = defineEmits<{
  (e: "update:info", value: CompanyInfo): void;
}>();
const locates = computed(() => info.value.locations ?? []);

const showAppendModal = ref(false);
function onClickLocateBtn() {
  if (!showAppendModal.value) {
    showAppendModal.value = true;
  }
}
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
  ["도/시", "city"],
  ["군/구", "county"],
  ["읍/면/동", "town"],
  ["우편번호", "postalCode"],
  ["상세주소", "detailLocate"],
  ["성", "firstName"],
  ["이름", "lastName"],
  ["핸드폰번호", "phone"],
] as [i: string, j: keyof Locate][];
</script>

<template>
  <n-space
    v-if="info"
    style="overflow-x: auto"
    :wrap="false"
    item-style="padding: 10px"
  >
    <n-tooltip v-for="(i, idx) in locates" :key="idx" trigger="hover">
      <template #trigger>
        <n-tag
          round
          :closable="!readonly"
          @close="() => onLocateClose(i as Locate)"
        >
          {{ i.alias }}
        </n-tag>
      </template>
      <!-- keyword:  {{ locateDesc(i) }} -->
      <n-card style="width: 25vw" title="주소지 정보">
        <template #header-extra>
          <n-button
            v-if="
              (!info.shipLocate ||
                info.shipLocate.postalCode !== i.postalCode ||
                info.shipLocate.alias !== i.alias) &&
              !readonly
            "
            size="small"
            @click="() => setShipAddr(i as Locate)"
          >
            배송지 선정
          </n-button>
        </template>
        <n-space v-for="(j, idx2) in locateKey" :key="idx2 + '2'">
          <n-text type="info">
            {{ j[0] }}
          </n-text>
          <n-text type="primary">
            {{ i[j[1]] }}
          </n-text>
        </n-space>
      </n-card>
    </n-tooltip>
    <n-button v-if="!readonly" round size="small" @click="onClickLocateBtn">
      추가
    </n-button>
    <locate-append-modal
      v-model:showAppendModal="showAppendModal"
      @append-locate="onAppendLocate"
    />
  </n-space>
</template>
