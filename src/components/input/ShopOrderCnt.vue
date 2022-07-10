<script setup lang="ts">
import {
  getOrderCnt,
  getPendingCnt,
  makeMsgOpt,
  ShopReqOrder,
} from "@/composables";
import { ORDER_STATE, ShopReqOrderJoined } from "@/types";
import { useMessage } from "naive-ui";
import { toRefs, computed, ref } from "vue";
const props = defineProps<{
  row: ShopReqOrderJoined;
  onSubmitPost?: () => void;
}>();
const { row } = toRefs(props);
let edit = ref(false);
const msg = useMessage();
const stockCnt = computed(() => row.value.stockCnt!);
const pendingCnt = computed(() =>
  row.value.allowPending ? getPendingCnt(stockCnt.value, row.value.orderCnt) : 0
);
const orderAvailCnt = computed(() =>
  getOrderCnt(row.value.stockCnt!, row.value.orderCnt, pendingCnt.value)
);

function onUpdate(val: number | null) {
  if (!val) return;
  else if (val < 1) {
    msg.warning("주문개수는 0이상이어야 합니다.");
    val = row.value.orderCnt;
    return;
  }
  row.value.orderCnt = val;
  row.value.amount = (row.value.prodPrice ?? 0) * val;
}
async function onSubmit() {
  const order = ShopReqOrder.fromJson(row.value);
  if (order) {
    order.update().then(() => {
      msg.info(`주문개수가 업데이트되었습니다.`, makeMsgOpt());
      if (props.onSubmitPost) {
        props.onSubmitPost();
      }
    });
  } else {
    msg.error(`주문개수가 업데이트에 실패하였습니다..`, makeMsgOpt());
  }
  edit.value = false;
}

function setEditMode() {
  if (row.value.orderState === ORDER_STATE.BEFORE_ORDER) {
    edit.value = true;
  }
}
</script>
<template>
  <n-input-number
    v-if="edit"
    :value="row.orderCnt"
    @update:value="onUpdate"
    @blur.stop="onSubmit"
    @keyup.enter.stop="onSubmit"
  />
  <n-text v-else style="color: inherit" @click="setEditMode">
    <n-tooltip trigger="hover">
      <template #trigger> {{ orderAvailCnt }} / {{ pendingCnt }} </template>
      주문시도 개수: {{ row.orderCnt }}, 재고 개수: {{ row.stockCnt }}
    </n-tooltip>
  </n-text>
</template>
