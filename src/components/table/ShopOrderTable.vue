<script setup lang="ts">
import { useShopReadOrderInfo, useTable } from "@/composables";
import { useAuthStore } from "@/stores";
import { ORDER_STATE, IoColOpt, ShopReqOrderJoined } from "@/types";

interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
}
const props = defineProps<Props>();
const user = useAuthStore().currUser;
const { orderJoined } = useShopReadOrderInfo({
  shopId: user.userInfo.userId,
  inStates: props.inStates ?? [],
  notStates: props.notStates ?? [],
});

const cols = [
  "userName",
  "prodName",
  "orderCnt",
  // "allowPending",
  // "stockCnt",
  "color",
  "size",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});

const { columns } = useTable<ShopReqOrderJoined>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField: "shopProdId",
});
</script>

<template>
  <n-card style="width: 80%">
    <n-data-table
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="columns"
      :data="orderJoined"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
    />
  </n-card>
</template>

<style scoped></style>
