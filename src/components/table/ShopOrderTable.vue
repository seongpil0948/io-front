<script lang="ts" setup>
import { h, ref, watchEffect } from "vue";
import {
  getOrderCnt,
  getPendingCnt,
  makeMsgOpt,
  ShopReqOrder,
  useParseOrderInfo,
  useShopReadOrderInfo,
  useTable,
} from "@/composables";
import { useAuthStore } from "@/stores";
import {
  IoColOpt,
  ORDER_STATE,
  ShopReqOrderJoined,
  type VendorOperInfo,
} from "@/types";
import { NGradientText, useDialog, useMessage } from "naive-ui";
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
  "orderCnt",
  "allowPending",
  "stockCnt",
  "color",
  "size",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});
const { columns, mapper, rendorTableBtn } = useTable<ShopReqOrderJoined>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField: "shopProdId",
});

let orderCntEdit = ref(false);
watchEffect(() => {
  columns.value.push(
    ...([
      {
        title: () => rendorTableBtn(() => null, "선택주문확정"),
        key: "editCnt",
        align: "center",
        render: () =>
          rendorTableBtn(() => {
            orderCntEdit.value = !orderCntEdit.value;
          }, "주문수량수정"),
      },
      {
        title: () => rendorTableBtn(() => null, "전체주문확정"),
        key: "requestOrder",
        align: "center",
        render: (row: ShopReqOrderJoined) =>
          rendorTableBtn(() => {
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
                  data.orderCnt = getOrderCnt(
                    row.stockCnt,
                    row.orderCnt,
                    data.pendingCnt
                  );
                  data.amount = data.orderCnt * row.prodPrice!;
                  if ((row.operInfo as VendorOperInfo).autoOrderApprove) {
                    data.orderState = ORDER_STATE.BEFORE_PAYMENT;
                  } else {
                    data.orderState = ORDER_STATE.BEFORE_APPROVE;
                  }

                  await data.update();
                  msg.success("주문 요청에 성공하셨습니다.", makeMsgOpt());
                } else {
                  msg.error("주문에 실패하였습니다.", makeMsgOpt());
                }
              },
            });
          }, "주문확정"),
      },
      {
        title: () => rendorTableBtn(() => null, "주문완료"),
        key: "etc",
        align: "center",

        render: () => rendorTableBtn(() => null, "아이오톡하기"),
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
  user.userInfo.userId,
  props.orderStates
);
useParseOrderInfo(
  mapper,
  user.userInfo.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    // onParse
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
  <drop-zone-card
    style="width: 80%"
    :listenClick="false"
    v-model:fileModel="fileModel"
  >
    <n-data-table
      v-if="orderJoined && orderJoined.length > 0"
      :table-layout="'fixed'"
      :scroll-x="1800"
      :columns="columns"
      :data="orderJoined"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
    />
  </drop-zone-card>
</template>
