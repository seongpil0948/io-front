<script lang="ts" setup>
import {
  ORDER_STATE,
  ORDER_GARMENT_DB,
  useMappingOrderExcel,
  useOrderBasic,
  useOrderTable,
  useVirtualVendor,
  useShopVirtualProd,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { ref, shallowRef, watchEffect } from "vue";
import { IO_COSTS } from "@/constants";
import { storeToRefs } from "pinia";
import { NButton, NDataTable, NInputNumber, NSpace, NText } from "naive-ui";
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
  ioOrders: filteredOrders,
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
  downOrderItems,
} = useOrderBasic(user, filteredOrders, orders, checkedDetailKeys);

const sheetIdx = ref(0);
const startRow = ref(0);
const { virVendorProds } = useShopVirtualProd(auth.currUser);
const vendorProds = shallowRef<VendorGarment[]>([]);
const { userProd, msg } = useMappingOrderExcel(
  mapper,
  user.userInfo.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    ORDER_GARMENT_DB.batchCreate(user.userInfo.userId, newOrders).then(() => {
      newOrders.forEach((ord) => {
        ord.orderIds.forEach((id) => existOrderIds.value.add(id));
      });
      msg.success(`${newOrders.length} 개 주문건 추가 완료.`);
    });
  },
  sheetIdx,
  startRow,
  vendorProds
);
watchEffect(async () => {
  const ids = userProd.value.map((x) => x.vendorProdId);
  vendorProds.value = [
    ...virVendorProds.value,
    ...(await VENDOR_GARMENT_DB.listByIds(ids)),
  ];
});

async function orderDelAll() {
  await deleteAll();
  existOrderIds.value.clear();
}
// <<<<< COLUMNS <<<<<
const { virtualVendors } = useVirtualVendor(user.userInfo.userId);
async function downOrder() {
  await downOrderItems(filteredOrders.value, virtualVendors.value);
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
  <drop-zone-card
    v-model:fileModel="fileModel"
    :listen-click="!(filteredOrders.length > 0)"
  >
    <template #header> <div></div> </template>
    <template #header-extra>
      <n-space style="width: 100%" inline item-style="max-width: 100%">
        <n-button type="primary" @click="downSampleXlsx">
          주문취합 엑셀양식 다운
        </n-button>
        <n-input-number
          v-model:value="sheetIdx"
          :show-button="false"
          placeholder="시트번호입력"
        >
          <template #prefix> 시트번호 </template>
        </n-input-number>
        <n-input-number
          v-model:value="startRow"
          :show-button="false"
          placeholder="시작행번호입력"
        >
          <template #prefix> 시작행번호 </template>
        </n-input-number>
      </n-space>
    </template>
    <n-space v-if="filteredOrders.length > 0" vertical>
      <n-space justify="start">
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

        <n-button size="small" type="primary" @click="downOrder">
          주문정보 다운
        </n-button>
      </n-space>
      <n-data-table
        ref="tableRef"
        :table-layout="'fixed'"
        :scroll-x="800"
        :columns="tableCol"
        :data="filteredOrders"
        :pagination="
          Object.assign(
            { pageSize: 5 },
            showSizes
              ? {
                  showSizePicker: true,
                  pageSizes: [5, 10, 25, 50, 100],
                }
              : {}
          )
        "
        :bordered="false"
      />
    </n-space>
  </drop-zone-card>
  <coin-reduce-confirm-modal
    v-if="orders && orders.length > 0"
    :show-modal="showReqOrderModal"
    :user-id="user.userInfo.userId"
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
</template>
