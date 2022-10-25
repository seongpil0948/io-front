<script setup lang="ts">
import {
  getPickReqCols,
  pickReqDetailCols,
  ProdOrderByShop,
  ProdOrderCombined,
  SHIPMENT_DB,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShipOrder,
  useAlarm,
  useShipmentUncle,
} from "@/composable";
import { IO_COSTS } from "@/constants";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { NButton, useMessage } from "naive-ui";
import { computed, ref } from "vue";
import { useLogger } from "vue-logger-plugin";

const smtp = useAlarm();
const {
  orders,
  checkedKeys,
  garmentOrdersByShop,
  garmentOrders,
  onCheckDetailRow,
  onCheckRow,
  checkedDetailKeys,
} = useShipmentUncle(["BEFORE_APPROVE_PICKUP"]);

const selectedData = ref<ProdOrderByShop | null>(null);
function onClickDetail(data: ProdOrderByShop) {
  selectedData.value = data;
}

const showApprovePickup = ref(false);
const orderTargets = ref<ProdOrderCombined[]>([]);
function updateReqOrderShow(val: boolean) {
  if (!val) orderTargets.value = [];
  showApprovePickup.value = val;
}
const msg = useMessage();
const log = useLogger();
const auth = useAuthStore();
const expectedReduceCoin = computed(
  () => IO_COSTS.APPROVE_PICKUP * orderTargets.value.length
);
const u = auth.currUser;

async function onReqOrderConfirm() {
  // prodOrderIds
  const ids = orderTargets.value.map((x) => x.id);
  const targetOrd = orders.value.filter((y) =>
    y.items.some((item) => ids.includes(item.id))
  );
  return Promise.all(
    targetOrd.map((t) => SHIPMENT_DB.approvePickUp(t, expectedReduceCoin.value))
  )
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
        body: `${targetOrd.length} 건의  픽업승인이 완료되었습니다. `,
        notiLoadUri: "/",
        uriArgs: {},
      });
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      msg.error(`픽업 승인 실패. ${message}`, makeMsgOpt());
      log.error(u.userInfo.userId, `픽업 승인 실패. ${message}`);
      console.error(`픽업 승인 실패. `, err);
    })
    .finally(() => {
      orderTargets.value = [];
      showApprovePickup.value = false;
    });
}

const targetIds = computed(() => {
  const itemIds = new Set<string>();
  for (let i = 0; i < orders.value.length; i++) {
    const o = orders.value[i];
    if (checkedKeys.value.includes(o.shopId)) {
      o.items.forEach((x) => itemIds.add(x.id));
    }
    for (let j = 0; j < o.items.length; j++) {
      const item = o.items[j];
      if (checkedDetailKeys.value.includes(item.id)) {
        itemIds.add(item.id);
      }
    }
  }
  // return garmentOrders.value.filter((z) => itemIds.has(z.id));
  return itemIds;
});
function approveSelected() {
  orderTargets.value = garmentOrders.value.filter((x) =>
    targetIds.value.has(x.id)
  );
  showApprovePickup.value = true;
}

const reqCols = getPickReqCols(onClickDetail);
</script>
<template>
  <n-card>
    <n-space justify="end" style="margin-bottom: 1vh">
      <n-button size="small" type="primary" @click="approveSelected">
        선택승인
      </n-button>
    </n-space>
    <n-data-table
      :bordered="false"
      :columns="reqCols"
      :data="garmentOrdersByShop"
      :rowKey="(row: ProdOrderByShop) => row.shopId"
      @update:checked-row-keys="onCheckRow"
    />
    <coin-reduce-confirm-modal
      v-if="garmentOrdersByShop.length > 0"
      :showModal="showApprovePickup"
      @update:showModal="updateReqOrderShow"
      @onConfirm="onReqOrderConfirm"
      :userId="u.userInfo.userId"
      :expectedReduceCoin="expectedReduceCoin"
    >
      <template #default>
        픽업 승인 완료처리가 되면 품목별 1코인이 소모됩니다.
      </template>
    </coin-reduce-confirm-modal>
  </n-card>
  <n-card v-if="selectedData" :bordered="false" :title="selectedData.shopName">
    <n-data-table
      :bordered="false"
      :columns="pickReqDetailCols"
      :data="selectedData.items"
      :rowKey="(row: ShipOrder) => row.id"
      @update:checked-row-keys="onCheckDetailRow"
    />
  </n-card>
</template>
