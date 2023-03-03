<script setup lang="ts">
import {
  getPickReqCols,
  pickReqDetailCols,
  OrderItemByShop,
  SHIPMENT_DB,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // ShipOrder,
  useShipmentUncle,
  catchError,
  ORDER_STATE,
  ORDER_GARMENT_DB,
  getUserName,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { NButton, useMessage } from "naive-ui";
import { computed, ref } from "vue";
import { useAlarm } from "@io-boxies/vue-lib";
import { axiosConfig } from "@/plugin/axios";
const smtp = useAlarm();
const inState: ORDER_STATE[] = ["BEFORE_APPROVE_PICKUP"];
const {
  orders,
  checkedKeys,
  ioOrdersByShop,
  // onCheckDetailRow,
  onCheckRow,
  checkedDetailKeys,
} = useShipmentUncle(inState);

const selectedData = ref<OrderItemByShop | null>(null);
function onClickDetail(data: OrderItemByShop) {
  selectedData.value = data;
}

const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser();

async function onReqOrderReject() {
  const ids = [...targetIds.value];
  const targetOrds = orders.value.filter((y) =>
    y.items.some((item) => ids.includes(item.id))
  );
  ORDER_GARMENT_DB.rejectPickup(targetOrds.map((x) => x.dbId))
    .then(async () => {
      msg.success("픽업 거절 완료.", makeMsgOpt());
      selectedData.value = null;
      await smtp.sendAlarm({
        toUserIds: [...targetOrds.map((x) => x.shopId)],
        subject: `inoutbox 주문 처리내역 알림.`,
        body: `${getUserName(u)}으로부터 픽업요청이 거절 되었습니다. `,
        notiLoadUri: "/",
        uriArgs: {},
        sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
        pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
      });
    })
    .catch((err) =>
      catchError({
        err,
        msg,
        prefix: "픽업 거절 실패.",
        uid: u.userInfo.userId,
      })
    );
}
async function onReqOrderConfirm() {
  // orderItemIds
  const ids = [...targetIds.value];
  const targetOrd = orders.value.filter((y) =>
    y.items.some((item) => ids.includes(item.id))
  );
  return Promise.all(targetOrd.map((t) => SHIPMENT_DB.approvePickUp(t)))
    .then(async () => {
      msg.success("픽업 승인완료.", makeMsgOpt());
      selectedData.value = null;
      await smtp.sendAlarm({
        toUserIds: [
          ...targetOrd.map((x) => x.shopId),
          ...targetOrd.flatMap((x) => x.vendorIds),
          u.userInfo.userId,
        ],
        subject: `inoutbox 주문 처리내역 알림.`,
        body: `${getUserName(u)}으로부터 픽업승인이 완료 되었습니다. `,
        notiLoadUri: "/",
        uriArgs: {},
        sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
        pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
      });
    })
    .catch((err) =>
      catchError({
        err,
        msg,
        prefix: "픽업 승인 실패.",
        uid: u.userInfo.userId,
      })
    );
}

const targetIds = computed(() => {
  const itemIds = new Set<string>();
  for (let i = 0; i < orders.value.length; i++) {
    const o = orders.value[i];
    if (checkedKeys.value.includes(o.shopId)) {
      o.items.forEach((x) => {
        if (inState.includes(x.state)) {
          itemIds.add(x.id);
        }
      });
    }
    for (let j = 0; j < o.items.length; j++) {
      const item = o.items[j];
      if (!inState.includes(item.state)) continue;
      if (checkedDetailKeys.value.includes(item.id)) {
        itemIds.add(item.id);
      }
    }
  }
  // return ioOrders.value.filter((z) => itemIds.has(z.id));
  return itemIds;
});
// orderTargets.value = ioOrders.value.filter((x) => targetIds.value.has(x.id));

const reqCols = getPickReqCols(onClickDetail);
</script>
<template>
  <n-card>
    <n-space justify="end" style="margin-bottom: 1vh">
      <n-button size="small" type="primary" @click="onReqOrderReject">
        선택거절
      </n-button>
      <n-button size="small" type="primary" @click="onReqOrderConfirm">
        선택승인
      </n-button>
    </n-space>
    <n-data-table
      :bordered="false"
      :columns="reqCols"
      :data="ioOrdersByShop"
      :row-key="(row: OrderItemByShop) => row.shopId"
      @update:checked-row-keys="onCheckRow"
    />
  </n-card>
  <n-card v-if="selectedData" :bordered="false" :title="selectedData.shopName">
    <n-data-table
      :bordered="false"
      :columns="pickReqDetailCols"
      :data="selectedData.items"
    />
    <!-- :row-key="(row: ShipOrder) => row.id"
      @update:checked-row-keys="onCheckDetailRow"     -->
  </n-card>
</template>
