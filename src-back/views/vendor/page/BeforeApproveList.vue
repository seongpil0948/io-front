<script setup lang="ts">
import { ORDER_STATE } from "@/types";
</script>
<template>
  <n-h1>거래처 주문 요청</n-h1>
  <vendor-order-table :inStates="[ORDER_STATE.BEFORE_APPROVE]" showSizes />
</template>
