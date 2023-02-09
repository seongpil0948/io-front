<script setup lang="ts">
import {
  useOrderTable,
  ORDER_STATE,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  OrderItemCombined,
  useContactUncle,
  useOrderBasic,
  catchError,
  validateUser,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import {
  NButton,
  NCard,
  NDataTable,
  NSelect,
  NSpace,
  useMessage,
} from "naive-ui";

const msg = useMessage();
const inStates: ORDER_STATE[] = ["BEFORE_PICKUP_REQ"];
const shopOrderStore = useShopOrderStore();

const auth = useAuthStore();
const filteredOrders = shopOrderStore.getFilteredOrder(inStates);
const orders = shopOrderStore.getOrders(inStates);
const ioOrdersByVendor =
  shopOrderStore.getGarmentOrdersByVendor(filteredOrders);
const {
  tableRef,
  byVendorCol,
  selectedData, // selected
  targetOrdItemIds,
  targetIds,
  targetOrdDbIds,
  tableCol,
  targetOrdItems,
} = useOrderTable({
  ioOrders: filteredOrders,
  orders,
  updateOrderCnt: true,
  useAccountStr: false,
});
const { reqPickupRequest } = useOrderBasic(
  auth.currUser(),
  filteredOrders,
  orders,
  targetOrdItemIds
);

const { targetUncleId, contactUncleOpts, contractUncles } = useContactUncle();
async function pickupRequest() {
  const uncle = contractUncles.value.find(
    (x) => x.userInfo.userId === targetUncleId.value
  )!;
  if (!uncle) return msg.error("엉클을 선택 해주세요");
  else if (targetIds.value.size < 1 || targetOrdDbIds.value.size < 1) {
    return msg.error("주문을 선택 해주세요");
  }
  validateUser(auth.currUser(), auth.currUser().userInfo.userId);
  return reqPickupRequest({
    uncle,
    shop: auth.currUser(),
    orderDbIds: targetOrdDbIds.value,
    orderItemIds: targetIds.value,
    direct: false,
  })
    .catch((err) => {
      catchError({
        prefix: "픽업 요청 실패.",
        err,
        msg,
        uid: auth.currUser().userInfo.userId,
      });
    })
    .finally(() => {
      selectedData.value = null;
    });
}
</script>

<template>
  <n-space vertical align="center" item-style="width: 100%">
    <n-card title="픽업 가능목록">
      <template #header-extra>
        <n-space>
          <n-select
            v-model:value="targetUncleId"
            style="width: 10vw"
            placeholder="엉클 선택"
            :options="contactUncleOpts"
          />
          <n-button size="small" type="primary" @click="pickupRequest">
            픽업 요청
          </n-button>
        </n-space>
      </template>
      <n-data-table
        ref="tableRef"
        style="width: 100%"
        :table-layout="'fixed'"
        :scroll-x="800"
        :columns="byVendorCol"
        :data="ioOrdersByVendor"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
      />
    </n-card>
    <n-card
      v-if="selectedData"
      :bordered="false"
      :title="selectedData.vendorName"
    >
      <n-data-table
        :bordered="false"
        :columns="tableCol"
        :data="selectedData.items"
        :row-key="(row: OrderItemCombined) => row.id"
      />
    </n-card>
  </n-space>
</template>
