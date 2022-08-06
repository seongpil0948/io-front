<script setup lang="ts">
import { ProdOrderCombined, useReadVendorOrderGInfo } from "@/composable";
import { useAuthStore } from "@/store";
import { DataTableColumns } from "naive-ui";
import { ref } from "vue";

const currTab = ref<string>("beforeApproveList");
const auth = useAuthStore();
// const { orders, garmentOrders, garmentOrdersByShop } = useReadVendorOrderGInfo(
//   auth.currUser.userInfo.userId,
//   [],
//   []
// );
const columns: DataTableColumns<ProdOrderCombined> = [
  {
    type: "selection",
  },
  {
    title: "거래처명",
    key: "shopName",
  },
  {
    title: "index",
    key: "index",
  },
];
</script>
<template>
  <n-space vertical align="center">
    <n-card>
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          display-directive="show:lazy"
          tab="거래처 주문 요청"
          name="beforeApproveList"
        >
          <!-- <n-data-table
            :columns="columns"
            :data="garmentOrdersByShop"
            row-key="id"
            children-key="items"
            default-expand-all
          /> -->
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="승인 완료된 주문"
          name="afterApproveList"
        >
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
