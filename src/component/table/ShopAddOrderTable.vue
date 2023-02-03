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
import { ExclamationCircleOutlined } from "@vicons/antd";

interface Props {
  inStates?: ORDER_STATE[];
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

const { virVendorProds, userVirProds } = useShopVirtualProd(auth.currUser);
const vendorProds = shallowRef<VendorGarment[]>([]);
const {
  onGetOrder,
  onSaveMatch,
  tableCols,
  openSelectList,
  targetGarment,
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
  msg,
  mapper,
  useMatching,
  useMapping,
  data,
} = useMatch({
  afterReverseMap: () => Promise.resolve(fillMatchData()),
  virVendorProds,
  userVirProds,
});
const { fillMatchData } = useMappingOrderExcel({
  mapper,
  uid: uid,
  fs: fileModel,
  existIds: existOrderIds,
  userProd: data,
  matchData,
  msg,
});

watchEffect(async () => {
  const ids = data.value.map((x) => x.vendorProdId);
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
async function getOrders(useMatch: boolean) {
  useMatching.value = useMatch;
  useMapping.value = !useMatch;
  await onGetOrder();
  useMatching.value = false;
  useMapping.value = false;
}
async function handleUploadSelect(key: string | number) {
  switch (key) {
    case "uploadOrder":
      uploadOrder();
      break;
    case "downSampleXlsx":
      downSampleXlsx();
      break;
    case "combineOrderMatch":
      await getOrders(true);
      break;
    case "combineOrderMap":
      await getOrders(false);
      break;
  }
}
const uploadOpts = [
  {
    label: "주문업로드",
    key: "uploadOrder",
  },
  {
    label: "주문취합 엑셀양식 다운",
    key: "downSampleXlsx",
  },
  {
    label: "주문 매칭취합",
    key: "combineOrderMatch",
  },
  {
    label: "주문 매핑취합",
    key: "combineOrderMap",
  },
];
async function handleOperSelect(key: string | number) {
  switch (key) {
    case "orderChecked":
      await orderChecked();
      break;
    case "orderAll":
      await orderAll();
      break;
    case "orderDoneInner":
      await orderDoneInner();
      break;
    case "deleteChecked":
      await deleteChecked();
      break;
    case "orderDelAll":
      await orderDelAll();
      break;
    case "downOrder":
      await downOrder();
      break;
  }
}
const operOpts = [
  {
    label: "선택 주문",
    key: "orderChecked",
  },
  {
    label: "전체 주문",
    key: "orderAll",
  },
  {
    label: "선택 주문완료처리",
    key: "orderDoneInner",
  },
  {
    label: "선택 삭제",
    key: "deleteChecked",
  },
  {
    label: "전체 삭제",
    key: "orderDelAll",
  },
  {
    label: "주문 다운",
    key: "downOrder",
  },
];
</script>
<template>
  <drop-zone-card
    ref="orderDropZoneRef"
    :key="filteredOrders.length > 0"
    v-model:fileModel="fileModel"
    :no-click="filteredOrders.length > 0"
    data-test="order-drop-zone"
  >
    <template #header>
      <n-space style="width: 100%" inline item-style="max-width: 100%">
        <n-dropdown
          trigger="click"
          :options="uploadOpts"
          @select="handleUploadSelect"
        >
          <n-button size="small">주문 취합/업로드</n-button>
        </n-dropdown>
        <n-dropdown
          v-if="filteredOrders.length > 0"
          trigger="click"
          :options="operOpts"
          @select="handleOperSelect"
        >
          <n-button size="small">주문 처리</n-button>
        </n-dropdown>
      </n-space>
    </template>
    <template #header-extra>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button quaternary circle>
            <template #icon>
              <n-icon><ExclamationCircleOutlined /></n-icon>
            </template>
          </n-button>
        </template>
        선택 주문완료처리는 쇼핑몰 내부적으로 주문을 완료 처리 합니다. <br />
        저장된 주문번호는 재수집 되지 않으므로 주의해서 사용 해주세용.
      </n-tooltip>
    </template>

    <!-- table-order-row used in E2E Testing -->
    <n-data-table
      v-if="filteredOrders.length > 0"
      ref="tableRef"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="tableCol"
      :data="filteredOrders"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
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
    <n-card>
      <n-space vertical>
        <n-space>
          상품선택<n-text v-if="targetGarment"
            >({{
              `${targetGarment?.inputProdName} | ${targetGarment?.inputColor} | ${targetGarment?.inputSize}`
            }})</n-text
          >
        </n-space>
        <n-space>
          <n-input
            v-model:value="searchInputVal"
            size="small"
            placeholder="상품검색"
          />
          <n-button size="small" @click="search"> 검색 </n-button>
        </n-space>
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
      </n-space>
    </n-card>
  </n-modal>
</template>

<style>
@media (max-width: 500px) {
  * .n-text {
    font-size: x-small;
  }
  .n-data-table .n-data-table-td {
    font-size: x-small;
  }
  .n-button {
    font-size: x-small;
  }
  .n-data-table .n-data-table-th {
    font-size: small;
  }
  :root {
    --n-title-font-size: 10;
  }
}
@media (max-width: 310px) {
  * .n-text {
    font-size: xx-small;
  }
  .n-data-table .n-data-table-td {
    font-size: xx-small;
  }
  .n-button {
    font-size: xx-small;
  }
  .n-data-table .n-data-table-th {
    font-size: x-small;
  }
  .n-tabs-tab__label {
    font-size: small;
  }
  :root {
    --n-title-font-size: 8;
  }
}
</style>
