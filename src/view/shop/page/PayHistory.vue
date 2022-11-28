<script setup lang="ts">
import { ORDER_STATE, useOrderTable } from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { onBeforeMount, computed, h } from "vue";
import { storeToRefs } from "pinia";
import { NGradientText } from "naive-ui";

const auth = useAuthStore();
const shopOrderStore = useShopOrderStore();
onBeforeMount(() => shopOrderStore.init(auth.currUser.userInfo.userId));
const { ioOrders, orders } = storeToRefs(shopOrderStore);

const { tableCol, tableRef } = useOrderTable({
  ioOrders,
  orders,
  updateOrderCnt: false,
  useChecker: false,
});
const columns = computed(() => {
  const cols = tableCol.value;
  cols.unshift({
    title: "주문상태",
    key: "state",
    filterOptions: Object.entries(ORDER_STATE).map(([k, v]) => {
      return {
        label: v,
        value: k,
      };
    }),
    filter(value, row) {
      return row.state === value;
    },
    align: "center",
    render(x) {
      return h(
        NGradientText,
        { type: "info" },
        { default: () => ORDER_STATE[x.state] }
      );
    },
  });
  return cols;
});
</script>
<template>
  <n-card
    v-if="orders && orders.length > 0"
    :segmented="{
      content: true,
    }"
  >
    <template #header>
      <n-space justify="center">
        <n-h2>주문 내역 조회</n-h2>
      </n-space>
    </template>
    <n-data-table
      ref="tableRef"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="columns"
      :data="ioOrders"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <n-result
    v-else
    style="margin-top: 30%"
    status="error"
    title="주문 전 데이터가 없습니다"
  />
</template>
