<script setup lang="ts">
import {
  IoOrder,
  ORDER_STATE,
  OrderItemCombined,
  getPendingCnt,
  dividePartial,
  setOrderCnt,
  ORDER_GARMENT_DB,
} from "@/composable";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { toRefs, ref, computed, onBeforeMount } from "vue";

const props = defineProps<{
  order: IoOrder;
  orderItem: OrderItemCombined;
}>();
const { orderItem, order } = toRefs(props);
onBeforeMount(() => {
  if (!order.value.items.map((x) => x.id).includes(orderItem.value.id)) {
    throw new Error("orderItem not belong to order");
  }
});

const edit = ref(false);
const msg = useMessage();
const stockCnt = computed(() =>
  orderItem.value.vendorProd ? orderItem.value.vendorProd.stockCnt : 0
);
const pendingCnt = computed(() =>
  orderItem.value.vendorProd
    ? getPendingCnt(
        stockCnt.value,
        orderItem.value.orderCnt,
        orderItem.value.vendorProd.allowPending
      )
    : 0
);
const activeCnt = computed(() => orderItem.value.activeCnt);

const editVal = ref(0);
onBeforeMount(() => {
  editVal.value = orderItem.value.orderCnt;
});
async function onBlur() {
  edit.value = false;
  const ordCnt = editVal.value;
  if (editVal.value === orderItem.value.orderCnt) {
    return;
  } else if (!ordCnt || typeof ordCnt !== "number") {
    editVal.value = orderItem.value.orderCnt;
    return;
  } else if (ordCnt < 1) {
    msg.warning("주문개수는 0이상이어야 합니다.");
    editVal.value = orderItem.value.orderCnt;
    return;
  }
  try {
    const prod = order.value.items.find((x) => x.id === orderItem.value.id);
    if (!prod) throw new Error("not matched prod order");
    else if (prod.state === "BEFORE_ORDER") {
      setOrderCnt(order.value, prod.id, ordCnt, false);
    } else if (prod.state === "BEFORE_READY") {
      await dividePartial({
        order: order.value,
        itemId: prod.id,
        orderCnt: ordCnt,
        update: false,
      });
      msg.success(`주문 분할에 성공하였습니다.`, makeMsgOpt());
      // console.log("===> after dividePartial", [...order.value.items]);
    } else {
      console.error(prod);
    }
    ORDER_GARMENT_DB.updateOrder(order.value).then(() => {
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
      orderItem.value.state
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
      <n-space v-if="orderItem.vendorProd" vertical>
        <n-text>
          주문시도 개수: {{ orderItem.orderCnt }}, 재고 개수:
          {{ orderItem.vendorProd.stockCnt }}
        </n-text>
        <n-text>
          미송 가능여부:
          <n-gradient-text
            :type="orderItem.vendorProd.allowPending ? 'info' : 'error'"
          >
            {{ orderItem.vendorProd.allowPending ? "가능" : "불가능" }}
          </n-gradient-text>
        </n-text>
      </n-space>
    </n-tooltip>
  </n-text>
</template>
