<script setup lang="ts">
import {
  catchError,
  IoShipment,
  OrderItemCombined,
  ORDER_STATE,
  SHIPMENT_DB,
  useOrderTable,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { onBeforeMount, computed, h, ref } from "vue";
import { storeToRefs } from "pinia";
import { DataTableColumns, NButton, NGradientText, useMessage } from "naive-ui";

const auth = useAuthStore();
const msg = useMessage();
const shopOrderStore = useShopOrderStore();
onBeforeMount(() => shopOrderStore.init(auth.currUser().userInfo.userId));
const { ioOrders, orders } = storeToRefs(shopOrderStore);

const { tableCol, tableRef } = useOrderTable({
  ioOrders,
  orders,
  updateOrderCnt: false,
  useChecker: false,
});
const showModal = ref(false);
const columns = computed<DataTableColumns<OrderItemCombined>>(() => {
  const cols = tableCol.value;
  cols.unshift({
    title: "상세보기",
    key: "detail",
    render: (row) =>
      h(
        NButton,
        {
          disabled: !row.shipManagerId || !row.shipmentId,
          onClick: async () => {
            if (!row.shipManagerId || !row.shipmentId) return;
            showModal.value = true;
            selectedItem.value.item = row;
            selectedItem.value.ship = await SHIPMENT_DB.getShipment(
              row.shipManagerId,
              row.shipmentId
            );
            if (!selectedItem.value.ship) msg.error("배송정보가 없습니다.");
          },
        },
        { default: () => "상세보기" }
      ),
  });
  cols.unshift({
    title: "주문상태",
    key: "state",
    filterOptions: Object.entries(ORDER_STATE).map(([k, v]) => {
      return {
        label: v,
        value: k,
      };
    }),
    filter(value, row) {
      return row.state === value;
    },
    align: "center",
    render(x) {
      return h(
        NGradientText,
        { type: "info" },
        { default: () => ORDER_STATE[x.state] }
      );
    },
  });
  return cols;
});
const selectedItem = ref<{
  item: OrderItemCombined | null;
  ship: IoShipment | null;
}>({
  item: null,
  ship: null,
});

const si = computed(() => selectedItem.value.item);
const ss = computed(() => selectedItem.value.ship);
function doneOrder() {
  if (!selectedItem.value.item) return;
  const selectedOrder = orders.value.find(
    (o) => o.dbId === selectedItem.value.item!.orderDbId
  );
  if (!selectedOrder)
    return msg.error("주문 아이템은 있지만 주문 정보가 존재하지 않습니다");
  SHIPMENT_DB.doneShipOrder(selectedOrder, selectedItem.value.item.id)
    .then(() => {
      selectedItem.value.item = null;
      selectedItem.value.ship = null;
      showModal.value = false;
    })
    .catch((err) =>
      catchError({ err, msg, uid: auth.currUser().userInfo.userId })
    );
}
</script>
<template>
  <n-card
    v-if="orders && orders.length > 0"
    :segmented="{
      content: true,
    }"
  >
    <template #header>
      <n-space justify="center">
        <n-h2>주문 내역 조회</n-h2>
      </n-space>
    </template>
    <n-data-table
      ref="tableRef"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="columns"
      :data="ioOrders"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <n-result
    v-else
    style="margin-top: 30%"
    status="error"
    title="주문 데이터가 없습니다"
  />
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 80vw"
      title="배송상세"
      size="huge"
      role="card"
      aria-modal="true"
    >
      <template #header-extra> hi~ </template>
      <n-h4>소매처</n-h4>
      <n-divider />
      <user-basic-card v-if="si" :user="si.shopProd" />
      <n-h4>도매처</n-h4>
      <n-divider />
      <user-basic-card v-if="si" :user="si.vendorProd" />
      <n-h4>배송정보</n-h4>
      <n-divider />
      <shipment-card v-if="ss" :shipment="ss"></shipment-card>

      <template #action>
        <n-button @click="doneOrder"> 수령 완료 </n-button>
      </template>
    </n-card>
  </n-modal>
</template>
