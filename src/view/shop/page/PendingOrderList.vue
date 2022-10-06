<script setup lang="ts">
import { ORDER_STATE, ProdOrderCombined } from "@/composable";
import { useAuthStore, useShopOrderStore, useVendorsStore } from "@/store";
import { commonTime } from "@/util";
import { DataTableColumns, NImage, NText } from "naive-ui";
import InfoCell from "@/component/table/InfoCell.vue";
import { computed, h, onBeforeMount } from "vue";
import { FilterOption } from "naive-ui/es/data-table/src/interface";
import CancelButton from "@/component/button/CancelButton.vue";

const auth = useAuthStore();
const vendorStore = useVendorsStore();

const shopOrderStore = useShopOrderStore();
const inStates = ["BEFORE_READY"] as ORDER_STATE[];
const { timeToDate } = commonTime();
onBeforeMount(() => shopOrderStore.init(auth.currUser.userInfo.userId));
const filteredOrders = shopOrderStore.getFilteredOrder(inStates);
const orders = shopOrderStore.getOrders(inStates);
const columns = computed(
  () =>
    [
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
        width: 200,
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
        sorter: (row1, row2) =>
          row1.shopGarment.prodName.localeCompare(row2.shopGarment.prodName),
      },
      {
        title: "도매이름",
        key: "vendorName",
        render: (x) => {
          const vendor = vendorStore.vendors.find(
            (y) => y.userInfo.userId === x.vendorId
          );
          return h(
            NText,
            {
              primary: true,
            },
            { default: () => vendor?.userInfo.displayName }
          );
        },
        filterOptions: filterOpts.value,
        filter(value, row) {
          const vendor = vendorStore.vendors.find(
            (y) => y.userInfo.userId === row.vendorId
          );
          return (vendor?.userInfo.displayName ?? "") == (value as string);
        },
      },
      {
        title: "총 주문수량",
        key: "orderCnt",
      },
      {
        title: "미송수량",
        key: "pendingCnt",
      },
      {
        title: "판매금액",
        key: "vendorGarment.vendorPrice",
      },
      {
        title: "합계",
        key: "amount",
        render: (x) =>
          h(
            NText,
            {
              primary: true,
            },
            {
              default: () => x.vendorGarment.vendorPrice * x.pendingCnt,
            }
          ),
      },
      {
        title: "결제완료일",
        key: "actualAmount.paidDate",
        render: (x) =>
          h(
            NText,
            {
              primary: true,
            },
            {
              default: () => timeToDate(x.actualAmount.paidDate),
            }
          ),
      },
      {
        key: "cancel",
        title: "취소접수",
        render: (prodOrder: ProdOrderCombined) =>
          h(
            CancelButton,
            {
              prodOrder,
            },
            { default: () => "취소요청" }
          ),
      },
    ] as DataTableColumns<ProdOrderCombined>
);
const filterOpts = computed<FilterOption[]>(() => {
  return vendorStore.vendors.map((z) => {
    const name = z.userInfo.displayName ?? "";
    return { label: name, value: name };
  });
});
</script>
<template>
  <n-card>
    <n-space vertical align="center">
      <n-h2>미송 주문 조회</n-h2>
      <n-data-table
        ref="tableRef"
        v-if="orders && orders.length > 0"
        :table-layout="'fixed'"
        :scroll-x="800"
        :columns="columns"
        :data="filteredOrders"
        :pagination="{
          'show-size-picker': true,
          'page-sizes': [5, 10, 25, 50, 100],
        }"
        :bordered="false"
      />
    </n-space>
  </n-card>
</template>
