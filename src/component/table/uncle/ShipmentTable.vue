<script setup lang="ts">
import {
  IoShipment,
  IoUser,
  ORDER_STATE,
  ShipOrder,
  ShipOrderByShop,
  useShipmentUncle,
} from "@/composable";
import {
  DataTableColumns,
  DataTableRowKey,
  NButton,
  useMessage,
} from "naive-ui";
import { computed, ref, h } from "vue";

const props = defineProps<{
  inStates: ORDER_STATE[];
}>();
const { orderShipsByShop, byShopCols, workers, refreshOrderShip, orders } =
  useShipmentUncle(props.inStates, onClickDetail);
const msg = useMessage();
const checkedKeys = ref<DataTableRowKey[]>([]);
function onCheckRow(keys: DataTableRowKey[]) {
  checkedKeys.value = keys;
}
const checkedDetailKeys = ref<DataTableRowKey[]>([]);
function onCheckDetailRow(keys: DataTableRowKey[]) {
  checkedDetailKeys.value = keys;
}
const selectedData = ref<ShipOrderByShop | null>(null);
function onClickDetail(data: ShipOrderByShop) {
  selectedData.value = data;
}
// const emits = defineEmits<{
//   (e: "worker:set", value: ShipOrder): void;
// }>();
function renderWorker(row: ShipOrder) {
  const worker = workers.value.find((x) => x.userInfo.userId === row.uncleId);
  const btn = h(
    NButton,
    {
      size: "small",
      onClick: () => {
        selectedOrderProdId.value = row.prodOrderId;
        openWorkerModal.value = true;
      },
    },
    { default: () => (worker ? worker.name : "미배정") }
  );
  return btn;
}

// 담당자 소매 소매주소 도매 도매주소 픽업수량
const byShopDetailCols = computed(() => {
  const cols = [
    {
      type: "selection",
    },
    {
      title: "담당자",
      key: "",
      render: renderWorker,
    },
    {
      title: "도매",
      key: "vendorGarment.userInfo.displayName",
    },
    {
      title: "소매주소",
      key: "receiveAddress.toStr",
    },
    {
      title: "도매주소",
      key: "startAddress.toStr",
    },
    {
      title: "픽업수량",
      key: "orderCnt",
    },
  ] as DataTableColumns<ShipOrder>;
  return cols.map((x: any) => {
    if (!["selection"].includes(x.type)) {
      x.sorter = "default";
    }
    return x;
  });
});
const openWorkerModal = ref(false);
const selectedOrderProdId = ref<string | null>(null);
async function onSelectWorker(val: IoUser) {
  const item = selectedData.value?.items.find(
    (x) => x.id === selectedOrderProdId.value
  );

  if (selectedData.value && item) {
    const shipment = IoShipment.fromJson(item);
    shipment.uncleId = val.userInfo.userId;
    const order = orders.find((x) => x.dbId === shipment.orderDbId);
    if (!order) throw new Error("order not exist");
    order.setState(item.id, "BEFORE_PICKUP");
    return Promise.all([order.update(), shipment.update()]).then(async () => {
      msg.success("담당자 배정이 완료되었습니다.");
      openWorkerModal.value = false;
      selectedOrderProdId.value = null;
      selectedData.value = null;
    });
  }
}
</script>
<template>
  <n-space vertical>
    <n-data-table
      :bordered="false"
      :columns="byShopCols"
      :data="orderShipsByShop"
      :rowKey="(row: ShipOrderByShop) => row.shopId"
      @update:checked-row-keys="onCheckRow"
    />
    <n-card
      v-if="selectedData"
      :bordered="false"
      :title="selectedData.shopName"
    >
      <n-data-table
        :bordered="false"
        :columns="byShopDetailCols"
        :data="selectedData.items"
        :rowKey="(row: ShipOrder) => row.shippingId"
        @update:checked-row-keys="onCheckDetailRow"
      />
    </n-card>
  </n-space>
  <select-worker-modal
    v-model:openModal="openWorkerModal"
    @worker:selected="onSelectWorker"
  />
</template>
