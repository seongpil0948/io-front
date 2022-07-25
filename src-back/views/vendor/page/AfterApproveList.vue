<script setup lang="ts">
import { ORDER_STATE } from "@/types";
</script>
<template>
  <n-h1>승인 완료된 주문</n-h1>
  <vendor-order-table
    showState
    :notStates="[ORDER_STATE.BEFORE_APPROVE, ORDER_STATE.BEFORE_ORDER]"
    showSizes
  />
</template>
