<script lang="ts" setup>
import {
  ORDER_STATE,
  ORDER_GARMENT_DB,
  useOrderParseExcel,
  useOrderBasic,
  useOrderTable,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { ref } from "vue";
import { IO_COSTS } from "@/constants";
import { storeToRefs } from "pinia";
interface Props {
  inStates?: ORDER_STATE[];
  showSizes: boolean;
}

const props = defineProps<Props>();
const auth = useAuthStore();
const user = auth.currUser;
const fileModel = ref<File[]>([]);

const shopOrderStore = useShopOrderStore();
const { existOrderIds } = storeToRefs(shopOrderStore);
const filteredOrders = shopOrderStore.getFilteredOrder(props.inStates ?? []);
const orders = shopOrderStore.getOrders(props.inStates ?? []);
const { checkedDetailKeys, tableCol, tableRef, mapper } = useOrderTable({
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
  downProdOrders,
} = useOrderBasic(user, filteredOrders, orders, checkedDetailKeys);

const sheetIdx = ref(0);
const startRow = ref(0);
useOrderParseExcel(
  mapper,
  user.userInfo.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    ORDER_GARMENT_DB.batchCreate(user.userInfo.userId, newOrders).then(() => {
      newOrders.forEach((ord) => {
        ord.orderIds.forEach((id) => existOrderIds.value.add(id));
      });
    });
  },
  sheetIdx,
  startRow
);

async function orderDelAll() {
  await deleteAll();
  existOrderIds.value.clear();
}
// <<<<< COLUMNS <<<<<
function downOrder() {
  downProdOrders(filteredOrders.value);
}
function downSampleXlsx() {
  const a = document.createElement("a");
  // a.href = url
  a.href = "/example/sample.xlsx";
  a.download = "sample.xlsx";
  a.click();
  a.remove();
}
</script>
<template>
  <drop-zone-card :listenClick="false" v-model:fileModel="fileModel">
    <template #header>
      <n-space justify="start">
        <n-button size="small" type="primary" @click="downSampleXlsx">
          주문취합 엑셀양식 다운
        </n-button>
        <n-button size="small" type="primary" @click="downOrder">
          주문정보 다운
        </n-button>
        <n-input-number placeholder="시트번호입력" v-model:value="sheetIdx">
          <template #prefix> 시트번호 </template>
        </n-input-number>
        <n-input-number placeholder="시작행번호입력" v-model:value="startRow">
          <template #prefix> 시작행번호 </template>
        </n-input-number>
      </n-space>
    </template>
    <template #header-extra>
      <n-space
        v-if="orders && orders.length > 0"
        justify="start"
        style="margin-left: 5px"
        :wrap="false"
      >
        <n-button size="small" type="primary" @click="orderChecked">
          선택주문
        </n-button>
        <n-button size="small" type="primary" @click="orderAll">
          전체주문
        </n-button>
        <n-button size="small" type="primary" @click="deleteChecked">
          선택삭제
        </n-button>
        <n-button size="small" type="primary" @click="orderDelAll">
          전체삭제
        </n-button>
      </n-space>
    </template>
    <n-data-table
      ref="tableRef"
      v-if="filteredOrders.length > 0"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="tableCol"
      :data="filteredOrders"
      :pagination="
        showSizes
          ? {
              'show-size-picker': true,
              'page-sizes': [5, 10, 25, 50, 100],
            }
          : false
      "
      :bordered="false"
    />
    <coin-reduce-confirm-modal
      v-if="orders && orders.length > 0"
      :showModal="showReqOrderModal"
      @update:showModal="updateReqOrderShow"
      @onConfirm="onReqOrderConfirm"
      :userId="user.userInfo.userId"
      :expectedReduceCoin="expectedReduceCoin"
    >
      <template #title>주문을 전송 하시겠습니까? </template>
      <template #default>
        도매처에 주문 데이터를 전송 후
        <br />
        도매처에서 [<n-text class="under-bar"> 승인 </n-text>]할 경우 상품당
        {{ IO_COSTS.REQ_ORDER }} 코인이 소모 됩니다.
      </template>
    </coin-reduce-confirm-modal>
  </drop-zone-card>
</template>
