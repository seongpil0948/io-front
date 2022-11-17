<script setup lang="ts">
import { GarmentOrder, ORDER_STATE, ProdOrderCombined } from "@/composable";
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
const stockCnt = computed(() =>
  prodOrder.value.vendorGarment ? prodOrder.value.vendorGarment.stockCnt : 0
);
const pendingCnt = computed(() =>
  prodOrder.value.vendorGarment
    ? GarmentOrder.getPendingCnt(
        stockCnt.value,
        prodOrder.value.orderCnt,
        prodOrder.value.vendorGarment.allowPending
      )
    : 0
);
const activeCnt = computed(() => prodOrder.value.activeCnt);

const editVal = ref(0);
onBeforeMount(() => {
  editVal.value = prodOrder.value.orderCnt;
});
async function onBlur() {
  edit.value = false;
  const ordCnt = editVal.value;
  if (editVal.value === prodOrder.value.orderCnt) {
    return;
  } else if (!ordCnt || typeof ordCnt !== "number") {
    editVal.value = prodOrder.value.orderCnt;
    return;
  } else if (ordCnt < 1) {
    msg.warning("주문개수는 0이상이어야 합니다.");
    editVal.value = prodOrder.value.orderCnt;
    return;
  }
  try {
    const prod = order.value.items.find((x) => x.id === prodOrder.value.id);
    if (!prod) throw new Error("not matched prod order");
    else if (prod.state === "BEFORE_ORDER") {
      order.value.setOrderCnt(prod.id, ordCnt, false);
    } else if (prod.state === "BEFORE_READY") {
      await order.value.dividePartial(
        prod.id,
        ordCnt,
        // GarmentOrder.getPendingCnt(
        //   stockCnt.value,
        //   ordCnt,
        //   prodOrder.value.vendorGarment.allowPending
        // ),
        false
      );
      msg.success(`주문 분할에 성공하였습니다.`, makeMsgOpt());
      // console.log("===> after dividePartial", [...order.value.items]);
    } else {
      console.error(prod);
    }
    order.value.update().then(() => {
      msg.success(`주문개수가 업데이트에 성공하였습니다.`, makeMsgOpt());
    });
  } catch (err) {
    msg.error(
      err instanceof Error
        ? err.message
        : `주문개수 업데이트 실패 ${JSON.stringify(err)}`,
      makeMsgOpt()
    );
  }
}

function setEditMode() {
  if (
    (["BEFORE_ORDER", "BEFORE_READY"] as ORDER_STATE[]).includes(
      prodOrder.value.state
    )
  ) {
    edit.value = true;
  }
}
</script>
<template>
  <n-input-number
    v-if="edit"
    v-model:value="editVal"
    :show-button="false"
    style="width: 100%"
    :min="1"
    @blur="onBlur"
  />
  <n-text v-else style="color: inherit" @click="setEditMode">
    <n-tooltip trigger="hover">
      <template #trigger> {{ activeCnt }} / {{ pendingCnt }} </template>
      <n-space v-if="prodOrder.vendorGarment" vertical>
        <n-text>
          주문시도 개수: {{ prodOrder.orderCnt }}, 재고 개수:
          {{ prodOrder.vendorGarment.stockCnt }}
        </n-text>
        <n-text>
          미송 가능여부:
          <n-gradient-text
            :type="prodOrder.vendorGarment.allowPending ? 'info' : 'error'"
          >
            {{ prodOrder.vendorGarment.allowPending ? "가능" : "불가능" }}
          </n-gradient-text>
        </n-text>
      </n-space>
    </n-tooltip>
  </n-text>
</template>
