<script setup lang="ts">
import { computed, ref } from "vue";
import {
  catchError,
  ORDER_GARMENT_DB,
  ORDER_STATE,
  useContactUncle,
  useOrderTable,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { uniqueArr } from "@/util";
import {
  NButton,
  NCard,
  NDataTable,
  NH2,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  useMessage,
} from "naive-ui";
import { validateUser } from "@/composable/order/db/firebase";
import { axiosConfig } from "@/plugin/axios";
import { useAlarm } from "@io-boxies/vue-lib";
import { ioFire } from "@/plugin/firebase";
import { logEvent, getAnalytics } from "@firebase/analytics";

const auth = useAuthStore();
const inStates: ORDER_STATE[] = [
  "BEFORE_PICKUP_REQ",
  "BEFORE_APPROVE_PICKUP",
  "BEFORE_ASSIGN_PICKUP",
  "BEFORE_PICKUP",
  "ONGOING_PICKUP",
  "PICKUP_COMPLETE",
  "BEFORE_SHIP",
  "SHIPPING",
  "SHIPPING_PENDING",
  "SHIPPING_WAIT",
  "SHIPPING_COMPLETE",
];
const shopOrderStore = useShopOrderStore();

const targetOrders = shopOrderStore.getOrders(inStates);
const stateOrderItems = shopOrderStore.getFilteredOrder(inStates);
const targetOrderItems = computed(() =>
  stateOrderItems.value.filter((x) => x.orderType !== "RETURN")
);
const {
  checkedDetailKeys: targetKeys,
  tableCol: targetTCol,
  tableRef: targetRef,
} = useOrderTable({
  ioOrders: targetOrderItems,
  orders: targetOrders,
  updateOrderCnt: true,
});
const msg = useMessage();
const smtp = useAlarm();

// request return  >>>
async function returnReq() {
  const returnTargets = targetOrderItems.value.filter((x) =>
    targetKeys.value.includes(x.id!)
  );
  const orderDbIds: string[] = [];
  const orderItemIds: string[] = [];

  for (let i = 0; i < returnTargets.length; i++) {
    const orderItem = returnTargets[i];
    if (orderItem.orderDbId && !orderDbIds.includes(orderItem.orderDbId))
      orderDbIds.push(orderItem.orderDbId);
    if (!orderItemIds.includes(orderItem.id)) orderItemIds.push(orderItem.id);
  }
  ORDER_GARMENT_DB.returnReq(uniqueArr(orderDbIds), uniqueArr(orderItemIds))
    .then(async () => {
      msg.success(`${orderItemIds.length}건의 반품 요청이 완료 되었습니다.`);
      const targetVendorIds = uniqueArr(
        targetOrderItems.value.map((x) => x.vendorId)
      );
      await smtp.sendAlarm({
        toUserIds: targetVendorIds,
        subject: `inoutbox 주문 처리내역 알림.`,
        body: `반품을 요청이 도착 하였습니다. `,
        notiLoadUri: "/",
        uriArgs: {},
        sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
        pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
      });
      logEvent(getAnalytics(ioFire.app), "order_return_request", {
        len: orderItemIds.length,
      });
    })
    .catch((err: any) =>
      catchError({
        prefix: "반품 요청이 실패 되었습니다.",
        err,
        msg,
        uid: auth.currUser.userInfo.userId,
      })
    );
}
// request return  <<<
// pickup request in return approved   >>>
const u = auth.currUser;
const { targetUncleId, contactUncleOpts, contractUncles } = useContactUncle();
const filteredOrders = shopOrderStore.getFilteredOrder(["RETURN_APPROVED"]);
const orders = shopOrderStore.getOrders(["RETURN_APPROVED"]);
const ioOrdersByVendor =
  shopOrderStore.getGarmentOrdersByVendor(filteredOrders);
const { tableRef, byVendorCol, byVendorKeys } = useOrderTable({
  ioOrders: filteredOrders,
  orders,
  updateOrderCnt: true,
});

async function pickupRequest() {
  const uncle = contractUncles.value.find(
    (x) => x.userInfo.userId === targetUncleId.value
  )!;
  if (!uncle) return msg.error("엉클을 선택 해주세요");
  else if (byVendorKeys.value.length < 1) {
    return msg.error("주문을 선택 해주세요");
  }
  validateUser(u, u.userInfo.userId);
  const filtered = ioOrdersByVendor.value.filter((x) =>
    byVendorKeys.value.includes(x.vendorId)
  );
  const orderItemIds = filtered.flatMap((x) => x.items).map((y) => y.id);
  const orderIds: string[] = [];
  orders.value.forEach((x) => {
    if (x.itemIds.some((y) => orderItemIds.includes(y))) {
      orderIds.push(x.dbId);
    }
  });

  if (orderIds.length > 0) {
    ORDER_GARMENT_DB.reqPickup(orderIds, orderItemIds, uncle.userInfo.userId)
      .then(() => {
        msg.success("픽업 요청 성공!");
        logEvent(getAnalytics(ioFire.app), "order_pickup_request", {
          len: orderItemIds.length,
        });
      })
      .catch((err: any) =>
        catchError({
          prefix: "픽업 요청 실패.",
          err,
          msg,
          uid: u.userInfo.userId,
        })
      );
  } else {
    msg.warning("행을 선택 해주세요");
  }
}
// pickup request in return approved  >>>
const currTab = ref<string>("RETURN_REQ");
</script>
<template>
  <n-card>
    <template #header>
      <n-h2 class="under-bar" style="text-align: left"> 교환/반품 관리 </n-h2>
    </template>
    <n-tabs v-model:value="currTab">
      <n-tab-pane
        display-directive="show:lazy"
        tab="반품 요청"
        name="RETURN_REQ"
      >
        <n-card>
          <n-space vertical>
            <n-space justify="end" style="margin-left: 5px" :wrap="false">
              <n-button size="small" type="primary" @click="returnReq">
                선택반품
              </n-button>
            </n-space>
            <n-data-table
              v-if="targetOrders && targetOrders.length > 0"
              ref="targetRef"
              :table-layout="'fixed'"
              :scroll-x="800"
              :columns="targetTCol"
              :data="targetOrderItems"
              :pagination="{
                showSizePicker: true,
                pageSizes: [5, 10, 25, 50, 100],
              }"
              :bordered="false"
            />
          </n-space>
        </n-card>
      </n-tab-pane>
      <n-tab-pane
        display-directive="show:lazy"
        tab="반품 발송"
        name="RETURN_SHIP"
      >
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
      </n-tab-pane>
      <n-tab-pane
        display-directive="show:lazy"
        tab="교환 관리"
        name="EXCHANGE_MNG"
      >
        <not-implemented />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped></style>
