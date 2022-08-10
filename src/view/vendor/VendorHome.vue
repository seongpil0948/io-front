<script setup lang="ts">
import { ref } from "vue";
const currTab = ref<string>("beforeApproveList");
</script>
<template>
  <n-space vertical align="center">
    <n-card style="width: 70vw">
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          display-directive="show:lazy"
          tab="거래처 주문 요청"
          name="BEFORE_APPROVE"
        >
          <order-by-shop-expand-table :inStates="['BEFORE_APPROVE']" />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="승인 완료된 주문"
          name="BEFORE_PAYMENT"
        >
          <order-by-shop-expand-table
            :inStates="[
              'BEFORE_PAYMENT',
              'BEFORE_SHIP',
              'SHIPPING',
              'SHIPPING_COMPLETE',
            ]"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
