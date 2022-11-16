<script setup lang="ts"></script>
<template>
  <n-card>
    <template #header>
      <n-h2 class="under-bar" style="text-align: left"> 픽업 대기 주문 </n-h2>
    </template>
    <order-by-shop-expand-table :in-states="['BEFORE_PICKUP_REQ']" />
  </n-card>
</template>
