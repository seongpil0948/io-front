<script lang="ts" setup>
import {
  ORDER_STATE,
  IoColOpt,
  useTable,
  ORDER_GARMENT_DB,
  useReadShopOrderGInfo,
  useParseGarmentOrder,
  ProdOrderCombined,
  useOrderBasic,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { DataTableColumns, NImage, useMessage } from "naive-ui";
import { computed, h, ref, watchEffect } from "vue";
import { useLogger } from "vue-logger-plugin";
import ShopOrderCnt from "@/component/input/ShopOrderCnt.vue";
import { IO_COSTS } from "@/constants";
interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
  showSizes: boolean;
}

const msg = useMessage();
const props = defineProps<Props>();
const auth = useAuthStore();
const user = auth.currUser;
const fileModel = ref<File[]>([]);
const log = useLogger();

const { orders, existOrderIds, garmentOrders } = useReadShopOrderGInfo(
  user.userInfo.userId,
  props.inStates ?? [],
  props.notStates ?? []
);
const colKeys = [
  "vendorGarment.userInfo.displayName",
  "shopGarment.prodName",
  "orderCnt",
  "allowPending",
  // "stockCnt",
  "actualAmount.orderAmount",
  "shopGarment.size",
  "shopGarment.color",
].map((c) => {
  return { key: c } as IoColOpt;
});
const tableRef = ref<any>(null);
const keyField = "id";
const { columns, mapper, checkedKeys } = useTable<ProdOrderCombined>({
  userId: user.userInfo.userId,
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
} = useOrderBasic(user, garmentOrders, orders, checkedKeys);

const sheetIdx = ref(0);
const startRow = ref(0);
useParseGarmentOrder(
  mapper,
  user.userInfo.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    log.info(user.userInfo.userId, "newOrders: ", newOrders);
    ORDER_GARMENT_DB.batchCreate(user.userInfo.userId, newOrders).then(() => {
      newOrders.forEach((ord) => {
        ord.orderIds.forEach((id) => existOrderIds.value.add(id));
      });
    });
  },
  sheetIdx,
  startRow
);
const colResult = computed((): DataTableColumns<ProdOrderCombined> => {
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
        ...columns.value.slice(1),
      ]
    : [];
});
watchEffect(() => {
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.title = "주문/미송";
      x.render = (prodOrder: ProdOrderCombined) => {
        const order = orders.value.find((x) => {
          return x.getProdOrders(prodOrder.id)![0];
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
});
async function orderDelAll() {
  await deleteAll();
  existOrderIds.value.clear();
}
// <<<<< COLUMNS <<<<<

function downXlsx() {
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
    style="width: 80%"
    :listenClick="false"
    v-model:fileModel="fileModel"
  >
    <template #header>
      <n-space justify="start">
        <n-button size="small" type="primary" @click="downXlsx">
          주문취합 엑셀양식 다운
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
      v-if="orders && orders.length > 0"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="colResult"
      :data="garmentOrders"
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
  </drop-zone-card>
</template>
