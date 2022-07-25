<script setup lang="ts">
import { ORDER_STATE } from "@/types";
</script>
<template>
  <shop-add-order-table
    :inStates="[ORDER_STATE.BEFORE_ORDER]"
    :showSizes="true"
  />
</template>
