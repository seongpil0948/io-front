<script setup lang="ts">
import {
  getOrderCnt,
  getPendingCnt,
  makeMsgOpt,
  ShopReqOrder,
} from "@/composables";
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
  row.value.allowPending ? getPendingCnt(stockCnt.value, row.value.orderCnt) : 0
);
function onUpdate(val: number) {
  row.value.orderCnt = val;
  row.value.amount = (row.value.prodPrice ?? 0) * val;
}
async function onSubmit() {
  const order = ShopReqOrder.fromJson(row.value);
  if (order) {
    order.update().then(() => {
      msg.info(`주문개수가 업데이트되었습니다.`, makeMsgOpt());
      props.onSubmitPost();
    });
  } else {
    msg.error(`주문개수가 업데이트에 실패하였습니다..`, makeMsgOpt());
  }
}
const orderCnt = computed(() =>
  getOrderCnt(row.value.stockCnt!, row.value.orderCnt, pendingCnt.value)
);
</script>
<template>
  <n-input-number
    v-if="edit"
    :value="row.orderCnt"
    @update:value="onUpdate"
    @blur.stop="onSubmit"
    @keyup.enter.stop="onSubmit"
    :min="1"
  />
  <n-text v-else>
    <n-tooltip trigger="hover">
      <template #trigger> {{ orderCnt }} / {{ pendingCnt }} </template>
      주문시도 개수: {{ row.orderCnt }}
    </n-tooltip>
  </n-text>
</template>
