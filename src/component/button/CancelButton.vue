<script setup lang="ts">
import { OrderCancel, ProdOrder, useCancel } from "@/composable";
import { toRefs, ref, computed } from "vue";
import { useAuthStore } from "@/store";

const props = defineProps<{
  prodOrder: ProdOrder;
}>();
const emits = defineEmits<{
  (e: "cancelDone", value: OrderCancel): void;
}>();

const { prodOrder: p } = toRefs(props);
const { getCancel, cancelSelected } = useCancel();
const auth = useAuthStore();
const cancelCnt = ref(0);
const inValid = computed(
  () => p.value.orderCnt < cancelCnt.value || cancelCnt.value < 1
);
async function cancelSubmit() {
  if (cancelCnt.value < 1) return;
  const claim = getCancel(p.value.id, p.value.state, "", "ETC");
  await cancelSelected(
    auth.currUser.name,
    p.value.shopId,
    p.value.vendorId,
    p.value.orderDbId,
    p.value.id,
    claim,
    cancelCnt.value
  );
  emits("cancelDone", claim);
}
</script>

<template>
  <n-popover trigger="click">
    <template #trigger>
      <n-button type="error"> 취소요청</n-button>
    </template>
    <n-space>
      <n-input-number
        :disable="inValid"
        v-model:value="cancelCnt"
        :min="1"
        :show-button="false"
      />
      <div style="width: 10px"></div>
      <n-button @click="cancelSubmit"> 제출</n-button>
    </n-space>
  </n-popover>
</template>
