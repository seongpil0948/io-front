<script setup lang="ts"></script>
<template>
  <n-card>
    <template #header>
      <n-h2 class="under-bar" style="text-align: left">승인 완료된 주문</n-h2>
    </template>
    <vendor-order-by-shop-table :inStates="['BEFORE_PAYMENT']" />
  </n-card>
</template>
