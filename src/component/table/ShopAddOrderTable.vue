<script lang="ts" setup>
import {
  ORDER_STATE,
  useMappingOrderExcel,
  useOrderBasic,
  useOrderTable,
  useVirtualVendor,
  useShopVirtualProd,
  VendorGarment,
  VENDOR_GARMENT_DB,
  useMatch,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { ref, shallowRef, watchEffect, defineAsyncComponent } from "vue";
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
const { checkedDetailKeys, tableCol, tableRef } = useOrderTable({
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
  orderDoneInner,
} = useOrderBasic(user, filteredOrders, orders, checkedDetailKeys);

const { virVendorProds } = useShopVirtualProd(auth.currUser);
const vendorProds = shallowRef<VendorGarment[]>([]);
const {
  onGetOrder,
  onSaveMatch,
  tableCols,
  openSelectList,
  matchCols,
  showMatchModal,
  search,
  searchedData,
  searchInputVal,
  switchFilter,
  filteredMatchData,
  filterIsNull,
  uid,
  matchData,
  userProd,
  msg,
  mapper,
  useMatching,
  useMapping,
} = useMatch({
  afterReverseMap: () => mappingFiles(),
});
const { mappingFiles } = useMappingOrderExcel({
  mapper,
  uid: uid,
  fs: fileModel,
  existIds: existOrderIds,
  userProd,
  matchData,
  msg,
});

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
const AsyncDropZone = defineAsyncComponent(
  () => import("@/component/card/DropZoneCard.vue")
);
const orderDropZoneRef = shallowRef<null | InstanceType<typeof AsyncDropZone>>(
  null
);
function uploadOrder() {
  if (orderDropZoneRef.value && orderDropZoneRef.value.open) {
    orderDropZoneRef.value.open();
  } else {
    msg.error("재시도 해주세요!");
    console.error("orderDropZoneRef wrong", orderDropZoneRef.value);
  }
}
</script>
<template>
  <drop-zone-card
    ref="orderDropZoneRef"
    :key="filteredOrders.length > 0"
    v-model:fileModel="fileModel"
    :no-click="filteredOrders.length > 0"
    data-test="order-drop-zone"
  >
    <template #header> <div></div> </template>
    <template #header-extra>
      <n-space style="width: 100%" inline item-style="max-width: 100%">
        <n-button
          data-test="order-upload-btn"
          type="primary"
          @click="uploadOrder"
        >
          주문업로드
        </n-button>
        <n-button type="primary" @click="downSampleXlsx">
          주문취합 엑셀양식 다운
        </n-button>
        <n-button data-test="order-get-btn" type="primary" @click="onGetOrder">
          주문취합
        </n-button>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-checkbox v-model:checked="useMatching"> 수동 취합 </n-checkbox>
          </template>
          지원가능 서비스: 전체
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-checkbox v-model:checked="useMapping"> 매핑 취합 </n-checkbox>
          </template>
          지원가능 서비스: 카페24
        </n-tooltip>
      </n-space>
    </template>
    <n-space v-if="filteredOrders.length > 0" vertical>
      <n-space justify="end">
        <n-button
          data-test="order-send-selected-btn"
          size="small"
          type="primary"
          @click="orderChecked"
        >
          선택주문
        </n-button>
        <n-button
          data-test="order-send-all-btn"
          size="small"
          type="primary"
          @click="orderAll"
        >
          전체주문
        </n-button>
        <n-button
          data-test="order-delete-selected-btn"
          size="small"
          type="primary"
          @click="deleteChecked"
        >
          선택삭제
        </n-button>
        <n-button
          data-test="order-delete-all-btn"
          size="small"
          type="primary"
          @click="orderDelAll"
        >
          전체삭제
        </n-button>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button size="small" type="primary" @click="orderDoneInner">
              선택 주문완료처리
            </n-button>
          </template>
          쇼핑몰 내부적으로 주문을 완료 처리 합니다. <br />
          저장된 주문번호는 재수집 되지 않으므로 주의해서 사용 해주세용.
        </n-tooltip>

        <n-button size="small" type="primary" @click="downOrder">
          주문정보 다운
        </n-button>
      </n-space>
      <n-data-table
        ref="tableRef"
        row-class-name="table-order-row"
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
  <n-modal v-model:show="showMatchModal" style="margin: 5%">
    <n-card>
      <n-space style="margin-bottom: 10px" justify="end">
        <n-button v-if="filterIsNull" @click="() => switchFilter(false)">
          전체보기
        </n-button>
        <n-button v-else @click="() => switchFilter(true)">
          매칭실패만보기
        </n-button>
      </n-space>
      <n-data-table
        :data="filteredMatchData"
        :columns="matchCols"
        :single-line="false"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="800"
      />
      <template #action>
        <n-space justify="end">
          <n-button @click="onSaveMatch"> 주문데이터로 넘기기 </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
  <n-modal v-model:show="openSelectList" style="margin: 5%">
    <n-card title="상품선택">
      <template #header-extra>
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search"> 검색 </n-button>
      </template>
      <n-data-table
        ref="tableRef"
        :columns="tableCols"
        :data="searchedData"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="1200"
      />
    </n-card>
  </n-modal>
</template>
