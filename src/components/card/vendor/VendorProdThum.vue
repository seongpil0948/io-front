<template>
  <n-card
    @click="onClickProd"
    style="cursor: pointer"
    content-style="padding: 0px 10px"
  >
    <template #cover>
      <img style="object-fit: fill; height: 100%" :src="prod.titleImgs[0]" />
    </template>
    <n-space class="row" inline>
      <n-text class="txt">{{ prod.vendorProdName }}</n-text>
      <n-text class="txt">{{ prod.colors.length }} Color</n-text>
    </n-space>
    <n-space class="row" inline>
      <n-text class="txt">19,000원</n-text>
      <n-text class="txt">재고({{ prod.allStockCnt }})</n-text>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import type { VendorUserProdCombined } from "@/types";
import { toRefs } from "vue";

const props = defineProps<{
  prod: VendorUserProdCombined;
}>();
const emits = defineEmits(["onClickProd"]);
const { prod } = toRefs(props);

function onClickProd() {
  emits("onClickProd", prod.value);
}
</script>
<style scoped>
.row {
  width: 100%;
}
.txt {
  font-size: 0.5rem;
}
</style>
