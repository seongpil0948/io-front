<script setup lang="ts">
import { GarmentOrder, ProdOrderCombined } from "@/composable";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { toRefs, ref, computed, onBeforeMount } from "vue";

const props = defineProps<{
  order: GarmentOrder;
  prodOrder: ProdOrderCombined;
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

const editVal = ref(0);
onBeforeMount(() => {
  editVal.value = prodOrder.value.activeCnt;
});
function onBlur() {
  edit.value = false;
  if (!editVal.value || typeof editVal.value !== "number") {
    editVal.value = prodOrder.value.orderCnt;
    return;
  } else if (editVal.value < 1) {
    msg.warning("주문개수는 0이상이어야 합니다.");
    editVal.value = prodOrder.value.orderCnt;
    return;
  }
  const prod = order.value.items.find((x) => x.id === prodOrder.value.id);
  if (!prod) throw new Error("not matched prod order");

  order.value.setOrderCnt(prod.id, editVal.value, false);
  order.value
    .update()
    .then(() => {
      msg.error(`주문개수가 업데이트에 성공하였습니다.`, makeMsgOpt());
    })
    .finally(() => (edit.value = false));
}

function setEditMode() {
  if (prodOrder.value.state === "BEFORE_ORDER") {
    edit.value = true;
  }
}
</script>
<template>
  <n-input-number
    v-if="edit"
    v-model:value="editVal"
    :show-button="false"
    style="min-width: 100px"
    :min="1"
    @blur="onBlur"
    @keyup.enter="onBlur"
  />
  <n-text v-else style="color: inherit" @click="setEditMode">
    <n-tooltip trigger="hover">
      <template #trigger> {{ activeCnt }} / {{ pendingCnt }} </template>
      주문시도 개수: {{ prodOrder.orderCnt }}, 재고 개수:
      {{ prodOrder.vendorGarment.stockCnt }}
    </n-tooltip>
  </n-text>
</template>
