<script setup lang="ts">
import {
  useOrderTable,
  ORDER_STATE,
  USER_DB,
  IoUser,
  ORDER_GARMENT_DB,
  useAlarm,
  ProdOrderCombined,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { useMessage } from "naive-ui";
import { onBeforeMount, ref, computed } from "vue";

const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser;
const inStates: ORDER_STATE[] = ["BEFORE_PICKUP_REQ"];
const shopOrderStore = useShopOrderStore();
const smtp = useAlarm();
const contractUncles = ref<IoUser[]>([]);
onBeforeMount(async () => {
  shopOrderStore.init(auth.currUser.userInfo.userId);
  const uids = u.shopInfo!.uncleUserIds;
  contractUncles.value = await USER_DB.getUserByIds(uids);
});
const opts = computed(() =>
  contractUncles.value.map((x) => {
    return { value: x.userInfo.userId, label: x.name };
  })
);
const filteredOrders = shopOrderStore.getFilteredOrder(inStates);
const orders = shopOrderStore.getOrders(inStates);
const garmentOrdersByVendor =
  shopOrderStore.getGarmentOrdersByVendor(filteredOrders);
const {
  tableRef,
  byVendorCol,
  byVendorKeys,
  selectedData, // selected
  targetIds,
  targetOrdDbIds,
  tableCol,
} = useOrderTable({
  garmentOrders: filteredOrders,
  orders,
  updateOrderCnt: true,
  useAccountStr: false,
});

const targetUncleId = ref<string | null>(null);
async function pickupRequest() {
  const uncle = contractUncles.value.find(
    (x) => x.userInfo.userId === targetUncleId.value
  )!;
  if (!uncle) return msg.error("엉클을 선택 해주세요");
  else if (targetIds.value.size < 1 || targetOrdDbIds.value.size < 1) {
    return msg.error("주문을 선택 해주세요");
  }

  await ORDER_GARMENT_DB.reqPickup(
    [...targetOrdDbIds.value],
    [...targetIds.value],
    uncle.userInfo.userId
  );
  msg.success("픽업 요청 성공!");
  await smtp.sendAlarm({
    toUserIds: [uncle.userInfo.userId],
    subject: `inoutbox 주문 처리내역 알림.`,
    body: `${uncle.name} 으로부터 픽업요청이 도착하였습니다. `,
    notiLoadUri: "/",
    uriArgs: {},
  });
}
</script>

<template>
  <n-space vertical align="center">
    <n-card title="픽업 가능목록">
      <template #header-extra>
        <n-space>
          <n-select
            style="width: 10vw"
            placeholder="엉클 선택"
            v-model:value="targetUncleId"
            :options="opts"
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
        :data="garmentOrdersByVendor"
        :pagination="{
          'show-size-picker': true,
          'page-sizes': [5, 10, 25, 50, 100],
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
        :rowKey="(row: ProdOrderCombined) => row.id"
      />
    </n-card>
  </n-space>
</template>
