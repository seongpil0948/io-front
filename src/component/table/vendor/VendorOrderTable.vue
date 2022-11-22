<script setup lang="ts">
import {
  getBasicColumns,
  ORDER_STATE,
  ProdOrderCombined,
  useApproveOrder,
  useCancel,
} from "@/composable";
import { useAuthStore, useVendorOrderStore } from "@/store";
import { uniqueArr } from "@/util";
import { getUserName } from "@io-boxies/js-lib";
import { computed } from "vue";

const props = defineProps<{
  showPaidDate: boolean;
  inStates?: ORDER_STATE[];
}>();

const auth = useAuthStore();
const u = auth.currUser;
const store = useVendorOrderStore();
const orders = store.getOrders(props.inStates ?? []);
const garmentOrders = store.getFilteredOrder(props.inStates ?? []);
const { checkedOrders, targetIds, targetOrdDbIds } = useApproveOrder({
  garmentOrders,
  orders,
  vendorId: u.userInfo.userId,
  expandCol: false,
  detailCol: false,
});
const tableCol = computed(() => getBasicColumns(props.showPaidDate));

const getRowKey = (row: ProdOrderCombined) => row.id;
function onClickOrder(keys: string[]) {
  checkedOrders.value = keys;
}
const { cancelApprove, cancelReject } = useCancel();
const tarOrders = computed(() =>
  orders.value.filter((x) => targetOrdDbIds.value.has(x.dbId))
);
async function approveCancel() {
  await cancelApprove(
    uniqueArr(tarOrders.value.map((x) => x.shopId)),
    [...targetOrdDbIds.value],
    [...targetIds.value],
    getUserName(u),
    u.userInfo.userId
  );
}
async function rejectCancel() {
  await cancelReject(
    uniqueArr(tarOrders.value.map((x) => x.shopId)),
    [...targetOrdDbIds.value],
    [...targetIds.value],
    getUserName(u),
    u.userInfo.userId
  );
}
</script>

<template>
  <n-card title=" ">
    <template #header-extra>
      <n-space v-if="inStates?.includes('CANCEL')">
        <n-button text class="under-bar" @click="approveCancel">
          취소 승인
        </n-button>
        <n-button text class="under-bar" @click="rejectCancel">
          취소 반려
        </n-button>
      </n-space>
    </template>
    <n-data-table
      :columns="tableCol"
      :data="garmentOrders"
      :pagination="{
        'show-size-picker': true,
        'page-sizes': [5, 10],
      }"
      :bordered="false"
      :row-key="getRowKey"
      @update:checked-row-keys="onClickOrder"
    />
  </n-card>
</template>
