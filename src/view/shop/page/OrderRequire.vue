<script setup lang="ts">
import {
  useReadShopOrderGInfo,
  useOrderBasic,
  useTable,
  ProdOrderCombined,
  IoColOpt,
} from "@/composable";
import { useAuthStore } from "@/store";
import { ref, computed, h } from "vue";
import ShopOrderCnt from "@/component/input/ShopOrderCnt.vue";
import { makeMsgOpt } from "@/util";
import { DataTableColumns, NImage, useMessage } from "naive-ui";
import { IO_COSTS } from "@/constants";
import InfoCell from "@/component/table/InfoCell.vue";

const auth = useAuthStore();
const keyField = "id";
const tableRef = ref<any>(null);
const msg = useMessage();

const { orders, garmentOrders } = useReadShopOrderGInfo(
  auth.currUser.userInfo.userId,
  ["BEFORE_ORDER"],
  []
);

const colKeys = [
  "vendorGarment.userInfo.displayName",
  "orderCnt",
  "vendorGarment.vendorPrice",
  "actualAmount.orderAmount",
  "shopGarment.size",
  "shopGarment.color",
].map((c) => {
  return { key: c } as IoColOpt;
});
const { columns, checkedKeys } = useTable<ProdOrderCombined>({
  userId: auth.currUser.userInfo.userId,
  colKeys,
  useChecker: true,
  keyField,
  onCheckAll: (to) => {
    if (tableRef.value) {
      const idxes = (tableRef.value.paginatedData as any[]).map((x) => x.index);
      checkedKeys.value = to
        ? garmentOrders.value
            .filter((o: any, idx: any) => idxes.includes(idx))
            .map((p: { [x: string]: any }) => p[keyField])
        : [];
    }
  },
});
const cols = computed((): DataTableColumns<ProdOrderCombined> => {
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.title = "주문/미송";
      x.render = (prodOrder: ProdOrderCombined) => {
        const order = orders.value.find((x) => {
          return x.getProdOrder(prodOrder.id);
        });
        return order
          ? h(ShopOrderCnt, {
              order,
              prodOrder,
              onSubmitPost: () => {
                !prodOrder.vendorGarment.allowPending
                  ? msg.warning(
                      "해당상품은 미송을 잡을 수 없는 상품입니다.",
                      makeMsgOpt()
                    )
                  : msg.info(`주문개수가 업데이트되었습니다.`, makeMsgOpt());
              },
            })
          : "x";
      };
    }
  });
  return columns.value.length > 0
    ? [
        columns.value[0],
        {
          key: "titleImgs",
          title: "이미지",
          render: (x) =>
            h(
              NImage,
              {
                src: x.vendorGarment?.titleImgs[0] ?? "/img/x.png",
                width: "50",
                height: "50",
              },
              {}
            ),
        },
        {
          key: "info",
          title: "상품정보",
          width: 400,
          render: (x) =>
            h(
              InfoCell,
              {
                first: x.shopGarment.prodName,
                second: x.vendorGarment.vendorProdName,
                third: x.shopGarment.color + "/" + x.shopGarment.size,
              },
              {}
            ),
        },
        ...columns.value.slice(1),
      ]
    : [];
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
        :columns="cols"
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
