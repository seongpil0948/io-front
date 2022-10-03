<script setup lang="ts">
import { ORDER_STATE, ProdOrderCombined, useApproveOrder } from "@/composable";
import { IO_COSTS } from "@/constants";
import { useAuthStore, useVendorOrderStore } from "@/store";
import { DataTableColumns } from "naive-ui";
import { computed, ref, watchEffect } from "vue";

const props = defineProps<{
  showPaidDate: boolean;
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
  updateOrderModal,
  approveGarments,
  approveSelected,
  approveAll,
  showOrderModal,
  rejectSelected,
  orderTargets,
  showPartialModal,
  numOfAllow,
  completePay,
  returnApproved,
  returnReject,
  onProdReady,
  detailShopIds,
  columns,
  checkedOrders,
} = useApproveOrder({
  garmentOrders,
  orders,
  vendorId: u.userInfo.userId,
  expandCol: false,
  detailCol: true,
});
const shopTableCol = computed(() =>
  columns.value.filter((x) => x.type !== "selection")
);
const tableCol = computed((): DataTableColumns<ProdOrderCombined> => {
  const cols: DataTableColumns<ProdOrderCombined> = [
    {
      type: "selection",
    },
    {
      title: "주문상품",
      key: "vendorGarment.vendorProdName",
    },
    {
      title: "컬러",
      key: "vendorGarment.color",
    },
    {
      title: "사이즈",
      key: "vendorGarment.size",
    },
    {
      title: "재고개수",
      key: "vendorGarment.stockCnt",
    },
    {
      title: "주문수량",
      key: "orderCnt",
    },
    {
      title: "미송개수",
      key: "pendingCnt",
    },
  ];
  if (props.showPaidDate) {
    cols.push({
      title: "결제일",
      key: "actualAmount.paidDate",
    });
  }
  return cols;
});
const targetShops = computed(() =>
  garmentOrdersByShop.value.filter((x) =>
    detailShopIds.value.includes(x.shopId)
  )
);

const currTab = ref<string | null>(null);
watchEffect(() => {
  console.log(currTab.value, !currTab.value, targetShops.value.length === 0);
  if (currTab.value && targetShops.value.length === 0) {
    currTab.value = null;
  } else if (!currTab.value && targetShops.value.length > 0) {
    currTab.value = targetShops.value[0].shopName;
  }
});

const getRowKey = (row: ProdOrderCombined) => row.id;
function onClickOrder(keys: string[]) {
  checkedOrders.value = keys;
}
</script>

<template>
  <n-space vertical align="center" justify="center">
    <n-data-table
      :bordered="false"
      :columns="shopTableCol"
      :data="garmentOrdersByShop"
      style="min-width: 65vw"
    />
    <n-card v-if="targetShops.length > 0" style="width: 65vw; margin-top: 5vh">
      <template #header>
        <n-space justify="start"> <n-h2>상세보기</n-h2> </n-space>
      </template>
      <template #header-extra>
        <n-space v-if="inStates?.includes('BEFORE_APPROVE')">
          <n-button text class="under-bar" @click="showPartial">
            부분승인(미송)
          </n-button>
          <n-button text class="under-bar" @click="approveSelected">
            선택승인
          </n-button>
          <n-button text class="under-bar" @click="rejectSelected">
            선택거부
          </n-button>
          <n-button text class="under-bar" @click="approveAll">
            전체승인
          </n-button>
        </n-space>
        <n-space v-else-if="inStates?.includes('BEFORE_PAYMENT')">
          <n-button text class="under-bar" @click="completePay">
            결제완료
          </n-button>
        </n-space>
        <n-space v-else-if="inStates?.includes('RETURN_REQ')">
          <n-button text class="under-bar" @click="returnApproved">
            반품승인
          </n-button>
          <n-button text class="under-bar" @click="returnReject">
            반품거절
          </n-button>
        </n-space>
        <n-space v-else-if="inStates?.includes('BEFORE_READY')">
          <n-button text class="under-bar" @click="onProdReady">
            출고리스트에 올리기
          </n-button>
        </n-space>
      </template>
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          v-for="(data, i) in targetShops"
          :key="i"
          display-directive="show:lazy"
          :tab="data.shopName"
          :name="data.shopName"
        >
          <n-data-table
            :columns="tableCol"
            :data="data.items"
            :pagination="{
              'show-size-picker': true,
              'page-sizes': [5, 10, 25, 50, 100],
            }"
            :bordered="false"
            :rowKey="getRowKey"
            @update:checked-row-keys="onClickOrder"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
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

<style scoped>
.under-bar {
  font-size: 1.2rem;
}
</style>
