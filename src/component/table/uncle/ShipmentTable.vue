<script setup lang="ts">
import {
  IoShipment,
  ORDER_STATE,
  useShipmentUncle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShipOrderByShop,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShipOrder,
  ORDER_GARMENT_DB,
  setState,
  SHIPMENT_DB,
  IoUser,
  getUserName,
} from "@/composable";
import { axiosConfig } from "@/plugin/axios";

import { useAlarm } from "@io-boxies/vue-lib";
import { useMessage } from "naive-ui";

const props = defineProps<{
  inStates: ORDER_STATE[];
}>();
const {
  orderShipsByShop,
  byShopCols,
  orders,
  selectedData,
  checkedDetailKeys,
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
  if (!selectedData.value) return;
  const items = selectedData.value.items.filter((x) =>
    checkedDetailKeys.value.includes(x.shippingId)
  );
  const userIds = new Set<string>();
  const data: Partial<IoShipment>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    userIds.add(val.userInfo.userId);
    item.uncleId = val.userInfo.userId;
    data.push({
      managerId: item.managerId,
      shippingId: item.shippingId,
      uncleId: item.uncleId,
    });

    const order = orders.value.find((x) => x.dbId === item.orderDbId);
    if (!order) throw new Error("order not exist");
    [order.shopId, ...order.vendorIds].forEach((uid) => userIds.add(uid));
    if (item.state === "BEFORE_ASSIGN_PICKUP") {
      setState(order, item.id, "BEFORE_PICKUP");
      await ORDER_GARMENT_DB.updateOrder(order);
    }
  }
  await SHIPMENT_DB.batchUpdate(data);
  msg.success("담당자 배정이 완료되었습니다.");
  await smtp.sendAlarm({
    toUserIds: [...userIds],
    subject: `inoutbox 주문 처리내역 알림.`,
    body: `배송 담당자 ${getUserName(val)} 님이 배정되었습니다.`,
    notiLoadUri: "/",
    uriArgs: {},
    sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
    pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
  });
  selectedData.value = null;
  checkedDetailKeys.value = [];
  openWorkerModal.value = false;
}
function tryOpen() {
  if (checkedDetailKeys.value.length < 1) {
    return msg.error("배송건을 한개이상 선택해주세요!");
  }
  openWorkerModal.value = true;
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
      <template #header-extra>
        <n-button type="primary" @click="tryOpen">선택 담당자 배정</n-button>
      </template>
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
