<script setup lang="ts">
import { ORDER_STATE, useOrderBasic, useOrderTable } from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { IO_COSTS } from "@/constants";
import { onBeforeMount } from "vue";

const auth = useAuthStore();
const inStates: ORDER_STATE[] = ["BEFORE_ORDER"];
const shopOrderStore = useShopOrderStore();
onBeforeMount(() => shopOrderStore.init(auth.currUser.userInfo.userId));
const orders = shopOrderStore.getOrders(inStates);
const filteredOrders = shopOrderStore.getFilteredOrder(inStates);

const { checkedDetailKeys, tableCol, tableRef } = useOrderTable({
  garmentOrders: filteredOrders,
  orders,
  updateOrderCnt: true,
});

const {
  orderAll,
  orderChecked,
  deleteAll,
  expectedReduceCoin,
  showReqOrderModal,
  updateReqOrderShow,
  onReqOrderConfirm,
  deleteChecked,
} = useOrderBasic(auth.currUser, filteredOrders, orders, checkedDetailKeys);
</script>
<template>
  <n-card
    v-if="orders && orders.length > 0"
    :segmented="{
      content: true,
    }"
  >
    <template #header>
      <n-space justify="center">
        <n-h2> 주문 해야할 주문 </n-h2>
      </n-space>
    </template>
    <n-space vertical>
      <n-space justify="end" style="margin-left: 5px" :wrap="false">
        <n-button size="small" type="primary" @click="orderChecked">
          선택주문
        </n-button>
        <n-button size="small" type="primary" @click="orderAll">
          전체주문
        </n-button>
        <n-button size="small" type="primary" @click="deleteChecked">
          선택삭제
        </n-button>
        <n-button size="small" type="primary" @click="deleteAll">
          전체삭제
        </n-button>
      </n-space>
      <n-data-table
        ref="tableRef"
        :columns="tableCol"
        :data="filteredOrders"
        :pagination="{
          'show-size-picker': true,
          'page-sizes': [5, 10, 25, 50, 100],
        }"
        :bordered="false"
      />
      <coin-reduce-confirm-modal
        :show-modal="showReqOrderModal"
        :user-id="auth.currUser.userInfo.userId"
        :expected-reduce-coin="expectedReduceCoin"
        @update:show-modal="updateReqOrderShow"
        @on-confirm="onReqOrderConfirm"
      >
        <template #title> 주문을 전송 하시겠습니까? </template>
        <template #default>
          도매처에 주문 데이터를 전송 후
          <br />
          도매처에서 [<n-text class="under-bar"> 승인 </n-text>]할 경우 상품당
          {{ IO_COSTS.REQ_ORDER }} 코인이 소모 됩니다.
        </template>
      </coin-reduce-confirm-modal>
    </n-space>
  </n-card>
  <n-result
    v-else
    style="margin-top: 30%"
    status="error"
    title="주문 전 데이터가 없습니다"
  />
</template>
