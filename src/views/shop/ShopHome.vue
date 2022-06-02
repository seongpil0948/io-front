<script setup lang="ts">
import { ORDER_STATE } from "@/types";
import { ref } from "vue";

const orderTableStates = ref([ORDER_STATE.BEFORE_ORDER]);
const currTab = ref<string>("reqOrderList");
</script>
<template>
  <n-space vertical>
    <n-card>
      <n-tabs
        v-model:value="currTab"
        type="card"
        tab-style="border-radius: 25px; margin-right: 2vw; padding: 0.8rem 2rem;"
      >
        <n-tab-pane tab="주문 해야할 내역" name="reqOrderList">
          <shop-order-table :orderStates="orderTableStates" />
        </n-tab-pane>
        <n-tab-pane tab="주문 완료된 내역" name="orderedList"> gg </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
