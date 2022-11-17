<script setup lang="ts"></script>
<template>
  <n-card>
    <template #header>
      <n-h2 class="under-bar" style="text-align: left"> 거래처 주문 요청 </n-h2>
    </template>
    <vendor-order-by-shop-table
      :in-states="['BEFORE_APPROVE']"
      :show-paid-date="false"
    />
  </n-card>
</template>
