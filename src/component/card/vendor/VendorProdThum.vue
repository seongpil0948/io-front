<template>
  <n-card
    @click="onClickProd"
    :style="`cursor: pointer; width: ${width}px;`"
    content-style="padding: 0px 10px; overflow: hidden"
  >
    <template #cover>
      <img
        style="object-fit: contain; height: 200px"
        :src="prod.titleImgs[0]"
      />
    </template>
    <n-space
      :item-style="`width: ${width - 10}px; text-align:start`"
      vertical
      justify="start"
      align="start"
    >
      <n-text class="txt">{{ prod.vendorProdName }}</n-text>
      <n-space inline justify="start" align="start">
        <n-text class="txt">{{ prod.colors.length }} Color</n-text>
        <n-text class="txt">19,000원</n-text>
        <n-text class="txt">재고({{ prod.allStockCnt }})</n-text>
      </n-space>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { VendorUserGarmentCombined } from "@/composable";
import { toRefs } from "vue";

const props = defineProps<{
  prod: VendorUserGarmentCombined;
  width: number;
}>();
const emits = defineEmits(["onClickProd"]);
const { prod } = toRefs(props);

function onClickProd() {
  emits("onClickProd", prod.value);
}
</script>
<style scoped>
.txt {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: auto;
  text-overflow: ellipsis;
  text-align: start;
}
</style>
