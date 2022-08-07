<script setup lang="ts">
import { GarmentOrder, ProdOrderCombined } from "@/composable";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { toRefs, ref, computed, onBeforeMount } from "vue";

const props = defineProps<{
  order: GarmentOrder;
  prodOrder: ProdOrderCombined;
  onSubmitPost: () => void;
}>();
const { prodOrder, order } = toRefs(props);
onBeforeMount(() => {
  if (!order.value.items.map((x) => x.id).includes(prodOrder.value.id)) {
    throw new Error("prodOrder not belong to order");
  }
});

const edit = ref(false);
const msg = useMessage();
const stockCnt = computed(() => prodOrder.value.vendorGarment.stockCnt);
const pendingCnt = computed(() =>
  GarmentOrder.getPendingCnt(
    stockCnt.value,
    prodOrder.value.orderCnt,
    prodOrder.value.vendorGarment.allowPending
  )
);
const activeCnt = computed(() => prodOrder.value.activeCnt);

function onUpdate(val: number | null) {
  if (!val) return;
  else if (val < 1) {
    msg.warning("주문개수는 0이상이어야 합니다.");
    val = prodOrder.value.orderCnt;
    return;
  }
  const prod = order.value.items.find((x) => x.id === prodOrder.value.id);
  if (!prod) throw new Error("not matched prod order");

  order.value.setOrderCnt(prod.id, val);
  order.value.update().then(() => {
    msg.error(`주문개수가 업데이트에 성공하였습니다.`, makeMsgOpt());
  });
}
async function onSubmit() {
  const order = GarmentOrder.fromJson(prodOrder.value);
  if (order) {
    order.update().then(() => {
      props.onSubmitPost();
    });
  } else {
    msg.error(`주문개수가 업데이트에 실패하였습니다..`, makeMsgOpt());
  }
  edit.value = false;
}

function setEditMode() {
  if (order.value.state === "BEFORE_ORDER") {
    edit.value = true;
  }
}
</script>
<template>
  <n-input-number
    v-if="edit"
    :value="prodOrder.orderCnt"
    @update:value="onUpdate"
    @blur.stop="onSubmit"
    @keyup.enter.stop="onSubmit"
  />
  <n-text v-else style="color: inherit" @click="setEditMode">
    <n-tooltip trigger="hover">
      <template #trigger> {{ activeCnt }} / {{ pendingCnt }} </template>
      주문시도 개수: {{ prodOrder.orderCnt }}, 재고 개수:
      {{ prodOrder.vendorGarment.stockCnt }}
    </n-tooltip>
  </n-text>
</template>
