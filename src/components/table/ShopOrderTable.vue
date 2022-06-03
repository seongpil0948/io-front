<script lang="ts" setup>
import { ref, h, watchEffect } from "vue";
import {
  ShopReqOrder,
  useParseOrderInfo,
  useReadOrderInfo,
  useTable,
} from "@/composables";
import { NInputNumber, useMessage } from "naive-ui";
import { useAuthStore } from "@/stores";
import type { IoColOpt, ORDER_STATE, ShopReqOrderJoined } from "@/types";

interface Props {
  orderStates: ORDER_STATE[];
}
const props = defineProps<Props>();
const msg = useMessage();
const auth = useAuthStore();
const user = auth.currUser;
const fileModel = ref<File[]>([]);

// >>>>> COLUMNS >>>>>
const cols = [
  "userName",
  "prodName",
  "color",
  "size",
  "amount",
  "orderCnt",
  "vendorProdName",
  "stockCnt",
].map((c) => {
  return { key: c } as IoColOpt;
});
const rowIdField = "shopProdId";
cols.unshift({
  key: "orderId",
  titleMapping: true,
  rowIdField,
});
const { columns, mapper } = useTable<ShopReqOrderJoined>({
  userId: user.userId,
  colKeys: cols,
  useChecker: true,
  keyField: "shopProdId",
});
watchEffect(() => {
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.render = (row) =>
        h(NInputNumber, {
          style: { width: "7rem" },
          value: row.orderCnt,
          onUpdateValue: (val) => {
            if (val && row.prodPrice) {
              row.orderCnt = val;
              row.amount = row.prodPrice * row.orderCnt;
            }
          },
          onBlur: async () => {
            await ShopReqOrder.fromJson(row)?.update(true);
            msg.info(`업데이트 되었습니다.`);
          },
          min: 1,
          // max: row.orderCnt
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
      :columns="columns"
      :data="orderJoined"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
    />
  </drop-zone-card>
</template>
