<script lang="ts" setup>
import { h, ref, watchEffect } from "vue";
import {
  getPendingCnt,
  ShopReqOrder,
  useParseOrderInfo,
  useShopReadOrderInfo,
  useTable,
} from "@/composables";
import { useAuthStore } from "@/stores";
import { IoColOpt, ORDER_STATE, ShopReqOrderJoined } from "@/types";
import { NButton, NGradientText, useDialog, useMessage } from "naive-ui";
import { TableBaseColumn } from "naive-ui/es/data-table/src/interface";
import ShopOrderCnt from "../input/ShopOrderCnt.vue";
import { getOrderById, getVendorProdById } from "@/plugins/firebase";

interface Props {
  orderStates: ORDER_STATE[];
}
const dialog = useDialog();
const msg = useMessage();
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
  "allowPending",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});
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
        render: (row: ShopReqOrderJoined) =>
          h(
            NButton,
            Object.assign({}, nBtnProps, {
              onClick: () => {
                dialog.info({
                  title: "주문정보",
                  content: `정말로 주문 하시겠습니까? `,
                  positiveText: "주문",
                  onPositiveClick: async () => {
                    const data = ShopReqOrder.fromJson(row);
                    if (data && row.stockCnt) {
                      data.pendingCnt = row.allowPending
                        ? getPendingCnt(row.stockCnt, row.orderCnt)
                        : 0;
                      data.orderCnt =
                        row.orderCnt - data.pendingCnt > row.stockCnt
                          ? row.stockCnt
                          : row.orderCnt - data.pendingCnt;
                      data.amount = data.orderCnt * row.prodPrice!;
                      data.orderState = ORDER_STATE.BEFORE_APPROVE;
                      await data.update();
                      msg.success("주문 요청에 성공하셨습니다.");
                    } else {
                      msg.error("주문에 실패하였습니다.");
                    }
                  },
                });
              },
            }),
            {
              default: () => "주문확정",
            }
          ),
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
    } else if (x.key === "amount") {
      x.render = (row: ShopReqOrderJoined) => row.amount.toLocaleString();
    } else if (x.key === "allowPending") {
      x.render = (row: ShopReqOrderJoined) =>
        h(
          NGradientText,
          {
            type: row.allowPending ? "info" : "error",
          },
          { default: () => (row.allowPending ? "가능" : "불가능") }
        );
    }
  });
});

// <<<<< COLUMNS <<<<<

const { orderJoined, existOrderIds } = useShopReadOrderInfo(
  user.userId,
  props.orderStates
);
useParseOrderInfo(
  mapper,
  user.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    for (let i = 0; i < newOrders.length; i++) {
      const order = newOrders[i];
      const exist = await getOrderById(order.shopId, order.shopProdId);
      if (exist) {
        order.orderCnt += exist.orderCnt;
        order.amount += exist.amount;
      }
      const vendorProd = await getVendorProdById(order.vendorProdId);
      if (!vendorProd)
        throw `${order.vendorProdId} is not Exist in Vendor Prod Doc`;
      await order.update();
    }
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
