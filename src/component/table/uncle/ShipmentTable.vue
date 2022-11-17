<script setup lang="ts">
import {
  IoShipment,
  ORDER_STATE,
  useShipmentUncle,
  useAlarm,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShipOrderByShop,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShipOrder,
} from "@/composable";
import { IoUser, getUserName } from "@io-boxies/js-lib";
import { useMessage } from "naive-ui";

const props = defineProps<{
  inStates: ORDER_STATE[];
}>();
const {
  orderShipsByShop,
  byShopCols,
  orders,
  selectedData,
  selectedOrderProdId,
  openWorkerModal,
  onCheckRow,
  byShopDetailCols,
  onCheckDetailRow,
} = useShipmentUncle(props.inStates);
const smtp = useAlarm();
const msg = useMessage();

// const emits = defineEmits<{
//   (e: "worker:set", value: ShipOrder): void;
// }>();

async function onSelectWorker(val: IoUser) {
  const item = selectedData.value?.items.find(
    (x) => x.id === selectedOrderProdId.value
  );

  if (selectedData.value && item) {
    const shipment = IoShipment.fromJson(item);
    shipment.uncleId = val.userInfo.userId;
    const order = orders.value.find((x) => x.dbId === shipment.orderDbId);
    if (!order) throw new Error("order not exist");
    order.setState(item.id, "BEFORE_PICKUP");
    return Promise.all([order.update(), shipment.update()]).then(async () => {
      msg.success("담당자 배정이 완료되었습니다.");
      await smtp.sendAlarm({
        toUserIds: [order.shopId, ...order.vendorIds, val.userInfo.userId],
        subject: `inoutbox 주문 처리내역 알림.`,
        body: `배송 담당자 ${getUserName(val)} 님이 배정되었습니다.`,
        notiLoadUri: "/",
        uriArgs: {},
      });
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
      :row-key="(row: ShipOrderByShop) => row.shopId"
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
        :row-key="(row: ShipOrder) => row.shippingId"
        @update:checked-row-keys="onCheckDetailRow"
      />
    </n-card>
  </n-space>
  <select-worker-modal
    v-model:openModal="openWorkerModal"
    @worker:selected="onSelectWorker"
  />
</template>
