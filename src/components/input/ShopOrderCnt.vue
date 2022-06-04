<script setup lang="ts">
import { getPendingCnt, ShopReqOrder } from "@/composables";
import { ShopReqOrderJoined } from "@/types";
import { useMessage } from "naive-ui";
import { toRefs, computed } from "vue";
const props = defineProps<{
  edit: boolean;
  row: ShopReqOrderJoined;
  onSubmitPost: () => void;
}>();
const { edit, row } = toRefs(props);
const msg = useMessage();
const stockCnt = computed(() => row.value.stockCnt ?? 0);
const pendingCnt = computed(() =>
  getPendingCnt(stockCnt.value, row.value.orderCnt)
);
function onUpdate(val: number) {
  row.value.orderCnt = val;
  row.value.amount = (row.value.prodPrice ?? 0) * val;
}
async function onSubmit() {
  await ShopReqOrder.fromJson(row.value)?.update(true);
  msg.info(`주문개수가 업데이트되었습니다.`);
  props.onSubmitPost();
}
</script>
<template>
  <n-input-number
    v-if="edit"
    :value="row.orderCnt"
    @update:value="onUpdate"
    @blur="onSubmit"
    @keyup.enter="onSubmit"
    :min="1"
  />
  <n-text v-else>
    <n-tooltip trigger="hover">
      <template #trigger>
        {{ row.orderCnt - pendingCnt }} / {{ pendingCnt }}
      </template>
      {{ row.orderCnt }}
    </n-tooltip>
  </n-text>
</template>
