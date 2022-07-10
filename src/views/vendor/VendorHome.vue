<script setup lang="ts">
import { ORDER_STATE } from "@/types";
import { ref } from "vue";

const currTab = ref<string>("beforeApproveList");
</script>
<template>
  <n-space vertical align="center">
    <n-card style="width: 80%">
      <n-tabs v-model:value="currTab">
        <!-- FIXME: 테이블 X 가 끝까지 안가는 원인을 찾고 업데이트 해야함 -->
        <n-tab-pane
          display-directive="show:lazy"
          tab="거래처 주문 요청"
          name="beforeApproveList"
        >
          <vendor-order-table :inStates="[ORDER_STATE.BEFORE_APPROVE]" />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="승인 완료된 주문"
          name="afterApproveList"
        >
          <vendor-order-table
            :notStates="[ORDER_STATE.BEFORE_APPROVE, ORDER_STATE.BEFORE_ORDER]"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
