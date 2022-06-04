<script lang="ts" setup>
import { h, ref, watchEffect } from "vue";
import { useParseOrderInfo, useReadOrderInfo, useTable } from "@/composables";
import { useAuthStore } from "@/stores";
import type { IoColOpt, ORDER_STATE, ShopReqOrderJoined } from "@/types";
import { NButton } from "naive-ui";
import { TableBaseColumn } from "naive-ui/es/data-table/src/interface";
import ShopOrderCnt from "../input/ShopOrderCnt.vue";

interface Props {
  orderStates: ORDER_STATE[];
}
const props = defineProps<Props>();
const auth = useAuthStore();
const user = auth.currUser;
const fileModel = ref<File[]>([]);

// >>>>> COLUMNS >>>>>
const cols = [
  "userName",
  "prodName",
  "color",
  "size",
  "orderCnt",
  "vendorProdName",
  "stockCnt",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});
// const rowIdField = "shopProdId";
// cols.unshift({
//   key: "orderId",
//   titleMapping: true,
//   rowIdField,
// });
const { columns, mapper } = useTable<ShopReqOrderJoined>({
  userId: user.userId,
  colKeys: cols,
  useChecker: true,
  keyField: "shopProdId",
});

const nBtnProps = {
  round: true,
  onClick: () => console.log("Click!!!"),
};

let orderCntEdit = ref(false);
watchEffect(() => {
  columns.value.push(
    ...([
      {
        title: () =>
          h(NButton, Object.assign(nBtnProps, {}), {
            default: () => "선택주문확정",
          }),
        key: "editCnt",
        align: "center",
        render: () =>
          h(
            NButton,
            Object.assign({}, nBtnProps, {
              onClick: () => {
                orderCntEdit.value = !orderCntEdit.value;
              },
            }),
            {
              default: () => "주문수량수정",
            }
          ),
      },
      {
        title: () =>
          h(NButton, Object.assign(nBtnProps, {}), {
            default: () => "전체주문확정",
          }),
        key: "requestOrder",
        align: "center",
        render: () =>
          h(NButton, Object.assign(nBtnProps, {}), {
            default: () => "주문확정",
          }),
      },
      {
        title: () =>
          h(NButton, Object.assign(nBtnProps, {}), {
            default: () => "주문완료",
          }),
        key: "etc",
        align: "center",

        render: () =>
          h(NButton, Object.assign(nBtnProps, {}), {
            default: () => "아이오톡하기",
          }),
      },
    ] as TableBaseColumn<any>[])
  );
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.render = (row: ShopReqOrderJoined) =>
        h(ShopOrderCnt, {
          edit: orderCntEdit.value,
          row,
          onSubmitPost: () => {
            orderCntEdit.value = false;
          },
        });
    }
  });
});

// <<<<< COLUMNS <<<<<

const { orderJoined, existOrderIds } = useReadOrderInfo(
  user.userId,
  props.orderStates
);
useParseOrderInfo(
  mapper,
  user.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    await Promise.all(newOrders.map((x) => x.update()));
  }
);
</script>
<template>
  <drop-zone-card :listenClick="false" v-model:fileModel="fileModel">
    <n-data-table
      v-if="orderJoined && orderJoined.length > 0"
      :table-layout="'fixed'"
      scroll-x="1800"
      :columns="columns"
      :data="orderJoined"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
    />
  </drop-zone-card>
</template>
