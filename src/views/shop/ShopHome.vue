<script setup lang="ts">
import { ORDER_STATE } from "@/types";
import { ref } from "vue";

const currTab = ref<string>("reqOrderList");
</script>
<template>
  <n-card>
    <n-tabs v-model:value="currTab">
      <!-- FIXME: 테이블 X 가 끝까지 안가는 원인을 찾고 업데이트 해야함 -->
      <n-tab-pane
        display-directive="show:lazy"
        tab="주문 해야할 내역"
        name="reqOrderList"
      >
        <shop-add-order-table :orderStates="[ORDER_STATE.BEFORE_ORDER]" />
      </n-tab-pane>
      <n-tab-pane
        display-directive="show:lazy"
        tab="주문 완료된 내역"
        name="afterOrderList"
      >
        <shop-order-table :notStates="[ORDER_STATE.BEFORE_ORDER]" />
      </n-tab-pane>
      <n-tab-pane tab="실시간 픽업 현황" name="pickStatus"> gg </n-tab-pane>
      <n-tab-pane tab="통계" name="statistics"> gg </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
