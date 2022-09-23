<script setup lang="ts">
import { NButton, NSpace } from "naive-ui";
import { ORDER_STATE, ProdOrderByShop, useApproveOrder } from "@/composable";
import { useAuthStore } from "@/store";
import { IO_COSTS } from "@/constants";
import { useVendorOrderStore } from "@/store/vendorOrder";
const props = defineProps<{
  inStates?: ORDER_STATE[];
}>();

const auth = useAuthStore();
const u = auth.currUser;
const store = useVendorOrderStore();
const orders = store.getOrders(props.inStates ?? []);
const garmentOrders = store.getFilteredOrder(props.inStates ?? []);
const garmentOrdersByShop = store.getGarmentOrdersByShop(garmentOrders);
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
  completePay,
  onProdReady,
} = useApproveOrder({
  garmentOrders,
  orders,
  vendorId: u.userInfo.userId,
  expandCol: true,
  detailCol: false,
});
function getRowKey(row: ProdOrderByShop) {
  return row.shopId;
}
</script>

<template>
  <n-card :bordered="false">
    <template #header> <div></div> </template>
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
        <n-button size="small" type="primary" @click="completePay">
          결제완료
        </n-button>
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
      :data="garmentOrdersByShop"
      :table-layout="'fixed'"
      :scroll-x="800"
      :rowKey="getRowKey"
      @update:checked-row-keys="onClickShop"
      default-expand-all
    />
  </n-card>
  <coin-reduce-confirm-modal
    v-if="inStates?.includes('BEFORE_APPROVE')"
    :showModal="showPartialModal"
    @update:showModal="onCloseModal"
    @onConfirm="approvePartial"
    :userId="u.userInfo.userId"
    :expectedReduceCoin="1"
  >
    <template #title>[ 부분승인 ] </template>
    <template #default>
      몇장만 승인 할까요?
      <n-input-number :min="0" v-model:value="numOfAllow" />
      <br />
      나머지 개수는 미송 주문건으로 이동됩니다.
      <br />
      (승인시 {{ IO_COSTS.REQ_ORDER }} 코인이 소모 됩니다.)
    </template>
  </coin-reduce-confirm-modal>
  <coin-reduce-confirm-modal
    v-if="inStates?.includes('BEFORE_APPROVE')"
    :showModal="showOrderModal"
    @update:showModal="updateOrderModal"
    @onConfirm="approveGarments"
    :userId="u.userInfo.userId"
    :expectedReduceCoin="orderReduceCoins"
  >
    <template #title> 해당 주문건들을 승인 하시겠습니까? </template>
    <template #default>
      {{ orderTargets.length }} 건의 주문건을 승인 하시면
      {{ orderReduceCoins }} 코인이 소모 됩니다.
      <br />
      승인된 주문건은 [<n-text class="under-bar"> 승인 완료된 주문</n-text>]
      에서 조회 가능합니다.
    </template>
  </coin-reduce-confirm-modal>
</template>
