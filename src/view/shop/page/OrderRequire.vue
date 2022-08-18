<script setup lang="ts">
import {
  useReadShopOrderGInfo,
  useOrderBasic,
  useOrderTable,
} from "@/composable";
import { useAuthStore } from "@/store";
import { IO_COSTS } from "@/constants";

const auth = useAuthStore();

const { orders, garmentOrders } = useReadShopOrderGInfo(
  auth.currUser.userInfo.userId,
  ["BEFORE_ORDER"]
);

const { checkedKeys, tableCol, tableRef } = useOrderTable({
  garmentOrders,
  orders,
  updateOrderCnt: true,
});

const {
  orderAll,
  orderChecked,
  deleteAll,
  expectedReduceCoin,
  showReqOrderModal,
  userPay,
  updateReqOrderShow,
  onReqOrderConfirm,
  deleteChecked,
} = useOrderBasic(auth.currUser, garmentOrders, orders, checkedKeys);
</script>
<template>
  <n-card
    :segmented="{
      content: true,
    }"
  >
    <template #header>
      <n-space justify="center">
        <n-h2> 주문 해야할 상품 </n-h2>
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
        v-if="orders && orders.length > 0"
        :table-layout="'fixed'"
        :scroll-x="800"
        :columns="tableCol"
        :data="garmentOrders"
        :pagination="{
          'show-size-picker': true,
          'page-sizes': [5, 10, 25, 50, 100],
        }"
        :bordered="false"
      />
      <coin-reduce-confirm-modal
        v-if="orders && orders.length > 0"
        :showModal="showReqOrderModal"
        @update:showModal="updateReqOrderShow"
        @onConfirm="onReqOrderConfirm"
        :userId="auth.currUser.userInfo.userId"
        :expectedReduceCoin="expectedReduceCoin"
        :userPay="userPay"
      >
        <template #title>주문을 전송 하시겠습니까? </template>
        <template #default>
          도매처에 주문 데이터를 전송 후
          <br />
          도매처에서 [<n-text class="under-bar"> 승인 </n-text>]할 경우 상품당
          {{ IO_COSTS.REQ_ORDER }} 코인이 소모 됩니다.
        </template>
      </coin-reduce-confirm-modal>
    </n-space>
  </n-card>
</template>
