<script setup lang="ts">
import { NButton, NSpace } from "naive-ui";
import { ORDER_STATE, OrderItemByShop, useApproveOrder } from "@/composable";
import { useAuthStore } from "@/store";
import { IO_COSTS } from "@/constants";
import { useVendorOrderStore } from "@/store/vendorOrder";
const props = defineProps<{
  inStates?: ORDER_STATE[];
}>();

const auth = useAuthStore();
const u = auth.currUser();
const store = useVendorOrderStore();
const orders = store.getOrders(props.inStates ?? []);
const ioOrders = store.getFilteredOrder(props.inStates ?? []);
const ioOrdersByShop = store.getGarmentOrdersByShop(ioOrders);
const {
  showPartial,
  onCloseModal,
  approvePartial,
  orderReduceCoins,
  showOrderModal,
  updateOrderModal,
  onClickShop,
  approveGarments,
  approveSelected,
  approveAll,
  rejectSelected,
  columns,
  orderTargets,
  showPartialModal,
  numOfAllow,
  targetOrdDbIds,
  targetShopIds,
  onProdReady,
} = useApproveOrder({
  ioOrders,
  orders,
  vendorId: u.userInfo.userId,
  expandCol: true,
  detailCol: false,
});
function getRowKey(row: OrderItemByShop) {
  return row.shopId;
}
</script>

<template>
  <n-card :bordered="false">
    <template #header> <div /> </template>
    <template #header-extra>
      <n-space v-if="inStates?.includes('BEFORE_APPROVE')">
        <n-button size="small" type="primary" @click="showPartial">
          부분승인(미송)
        </n-button>
        <n-button size="small" type="primary" @click="approveSelected">
          선택승인
        </n-button>
        <n-button size="small" type="primary" @click="rejectSelected">
          선택거부
        </n-button>
        <n-button size="small" type="primary" @click="approveAll">
          전체승인
        </n-button>
      </n-space>
      <n-space v-else-if="inStates?.includes('BEFORE_PAYMENT')">
        <vendor-complete-pay-button
          :target-ord-db-ids="[...targetOrdDbIds]"
          :items="orderTargets"
          :target-shop-ids="targetShopIds"
          button-text="결제완료"
          type="primary"
          size="small"
        />
        <!-- <n-button size="small" type="primary" @click="completePay">
          결제완료
        </n-button> -->
      </n-space>
      <n-space v-else-if="inStates?.includes('BEFORE_READY')">
        <n-button size="small" type="primary" @click="onProdReady">
          출고리스트에 올리기
        </n-button>
      </n-space>
    </template>
    <n-data-table
      :bordered="false"
      :columns="columns"
      :data="ioOrdersByShop"
      :table-layout="'fixed'"
      :scroll-x="800"
      :row-key="getRowKey"
      default-expand-all
      @update:checked-row-keys="onClickShop"
    />
  </n-card>
  <coin-reduce-confirm-modal
    v-if="inStates?.includes('BEFORE_APPROVE')"
    :show-modal="showPartialModal"
    :user-id="u.userInfo.userId"
    :expected-reduce-coin="1"
    @update:show-modal="onCloseModal"
    @on-confirm="approvePartial"
  >
    <template #title> [ 부분승인 ] </template>
    <template #default>
      몇장만 승인 할까요?
      <n-input-number v-model:value="numOfAllow" :min="0" />
      <br />
      나머지 개수는 미송 주문건으로 이동됩니다.
      <br />
      (승인시 {{ IO_COSTS.APPROVE_ORDER }} 원이 소모 됩니다.)
    </template>
  </coin-reduce-confirm-modal>
  <coin-reduce-confirm-modal
    v-if="inStates?.includes('BEFORE_APPROVE')"
    :show-modal="showOrderModal"
    :user-id="u.userInfo.userId"
    :expected-reduce-coin="orderReduceCoins"
    @update:show-modal="updateOrderModal"
    @on-confirm="approveGarments"
  >
    <template #title> 해당 주문건들을 승인 하시겠습니까? </template>
    <template #default>
      {{ orderTargets.length }} 건의 주문건을 승인 하시면
      {{ orderReduceCoins }} 원이 소모 됩니다.
      <br />
      승인된 주문건은 [<n-text class="under-bar"> 승인 완료된 주문 </n-text>]
      에서 조회 가능합니다.
    </template>
  </coin-reduce-confirm-modal>
</template>
