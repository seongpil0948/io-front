<template>
  <n-card
    :style="`cursor: pointer; width: ${width}px; height: 100%`"
    content-style="padding: 0px 10px; overflow: hidden"
    @click="onClickProd"
  >
    <template #cover>
      <n-image
        height="200"
        :src="prod.titleImgs[0]"
        object-fit="contain"
        lazy
        :intersection-observer-options="{
          root: '#image-scroll-container',
        }"
        :preview-disabled="true"
      />
    </template>
    <n-space
      style="margin-top: 3%; position: relative; gap: 0; margin-bottom: 1rem"
      :item-style="`width: ${width - 10}px; text-align:start`"
      vertical
      justify="start"
      align="start"
    >
      <n-text>
        {{ prod.vendorProdName }}
      </n-text>
      <n-text
        style="font-size: 0.5rem; position: absolute; bottom: -25%; right: 5%"
        >{{ prod.part }} / {{ prod.ctgr }}</n-text
      >
      <n-space inline justify="start" align="start">
        <n-text class="txt"> {{ prod.colors.length }} Color </n-text>
        <n-text class="txt">
          {{ prod.vendorPrice.toLocaleString() }}
        </n-text>
        <n-text class="txt"> 재고({{ prod.allStockCnt }}) </n-text>
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

.n-card:hover {
  box-shadow: 0 8px 8px 8px rgba(0, 0, 0, 0.2), 0 8px 8px 0 rgba(0, 0, 0, 0.14),
    0 8px 8px 0 rgba(0, 0, 0, 0.12) !important;
  transform: translate3d(0, 0, 0);
  transition: background 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
