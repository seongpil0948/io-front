<script setup lang="ts">
import { ORDER_STATE, ProdOrderCombined } from "@/composable";
import { toRefs } from "vue";

const props = defineProps<{
  garmentOrder: ProdOrderCombined;
  checked: boolean;
}>();
const { garmentOrder: o, checked } = toRefs(props);
const emits = defineEmits<{
  (e: "onClick", value: string): void;
}>();
function onClickChecker() {
  emits("onClick", o.value.id);
}
</script>
<template>
  <n-space inline>
    <logo-checker :size="1" :checked="checked" @click="onClickChecker" />
    <div style="width: 1vw"></div>
    <n-text :type="o.pendingCnt > 0 ? 'error' : 'primary'">
      {{ o.vendorGarment.vendorProdName }} / {{ o.vendorGarment.color }} /
      {{ o.vendorGarment.size }}
    </n-text>
    <n-text v-if="o.pendingCnt > 0" :type="'error'">
      {{ o.orderCnt }} ({{ o.pendingCnt }})
    </n-text>
    <n-text v-else :type="'primary'"> / {{ o.orderCnt }} </n-text>
    <n-text :type="'primary'"> {{ ORDER_STATE[o.state] }} </n-text>
  </n-space>
</template>
