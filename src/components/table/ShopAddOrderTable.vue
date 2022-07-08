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
import {
  getIoStore,
  getOrderById,
  getVendorProdById,
  writeOrderBatch,
} from "@/plugins/firebase";
import { useLogger } from "vue-logger-plugin";

interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
}
const dialog = useDialog();
const msg = useMessage();
const props = defineProps<Props>();
const auth = useAuthStore();
const user = auth.currUser;
const fileModel = ref<File[]>([]);
const log = useLogger();
// >>>>> COLUMNS >>>>>
const cols = [
  "userName",
  "prodName",
  "orderCnt",
  "allowPending",
  // "stockCnt",
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

// let orderCntEdit = ref(false);
watchEffect(() => {
  // TODO: 셔츠 두개에 대해, 주문 자동승인 테스트 하나는 결제전, 하나는 승인전이 떠야함
  //   columns.value.push(
  //     ...([
  //       {
  //         title: () => rendorTableBtn(() => null, "선택주문확정"),
  //         key: "editCnt",
  //         align: "center",
  //         render: () =>
  //           rendorTableBtn(() => {
  //             orderCntEdit.value = !orderCntEdit.value;
  //           }, "주문수량수정"),
  //       },
  // {
  //   title: () => rendorTableBtn(() => null, "전체주문확정"),
  //   key: "requestOrder",
  //   align: "center",
  //   render: (row: ShopReqOrderJoined) =>
  //     rendorTableBtn(() => {
  //       dialog.info({
  //         title: "주문정보",
  //         content: `정말로 주문 하시겠습니까? `,
  //         positiveText: "주문",
  //         onPositiveClick: async () => {
  //           const data = ShopReqOrder.fromJson(row);
  //           if (data && row.stockCnt) {
  //             data.pendingCnt = row.allowPending
  //               ? getPendingCnt(row.stockCnt, row.orderCnt)
  //               : 0;
  //             data.orderCnt = getOrderCnt(
  //               row.stockCnt,
  //               row.orderCnt,
  //               data.pendingCnt
  //             );
  //             data.amount = data.orderCnt * row.prodPrice!;
  //             if ((row.operInfo as VendorOperInfo).autoOrderApprove) {
  //               data.orderState = ORDER_STATE.BEFORE_PAYMENT;
  //             } else {
  //               data.orderState = ORDER_STATE.BEFORE_APPROVE;
  //             }

  //             await data.update();
  //             msg.success("주문 요청에 성공하셨습니다.", makeMsgOpt());
  //           } else {
  //             msg.error("주문에 실패하였습니다.", makeMsgOpt());
  //           }
  //         },
  //       });
  //     }, "주문확정"),
  // },
  // ] as TableBaseColumn<any>[])
  // );
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.render = (row: ShopReqOrderJoined) => h(ShopOrderCnt, { row });
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
function rowClassName(row: ShopReqOrderJoined) {
  const pendingCnt = row.allowPending
    ? getPendingCnt(row.stockCnt!, row.orderCnt)
    : 0;
  const orderAvailCnt = getOrderCnt(row.stockCnt!, row.orderCnt, pendingCnt);
  const orderNotAvailable = orderAvailCnt < row.orderCnt;
  return orderNotAvailable || pendingCnt > 0 ? "not-avail-order" : "";
}
// <<<<< COLUMNS <<<<<

const { orderJoined, existOrderIds } = useShopReadOrderInfo({
  shopId: user.userInfo.userId,
  inStates: props.inStates ?? [],
  notStates: props.notStates ?? [],
});
useParseOrderInfo(
  mapper,
  user.userInfo.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    log.debug("newOrders: ", newOrders);
    await writeOrderBatch(user.userInfo.userId, newOrders);
    // for (let i = 0; i < newOrders.length; i++) {
    //   const order = newOrders[i];
    //   const exist = await getOrderById(order.shopId, order.shopProdId);
    //   if (exist) {
    //     order.orderCnt += exist.orderCnt;
    //     order.amount += exist.amount;
    //   }
    //   await order.update();
    // }
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
      :scroll-x="800"
      :columns="columns"
      :data="orderJoined"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
      :row-class-name="rowClassName"
    />
  </drop-zone-card>
</template>

<style scoped>
:deep(.not-avail-order td) {
  color: red !important;
}
</style>
