<script setup lang="ts">
import { ref } from "vue";

const currTab = ref<string>("BEFORE_APPROVE_PICKUP");
</script>
<template>
  <n-space vertical align="center" item-style="width: 100%">
    <n-card style="width: 100%">
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          display-directive="show:lazy"
          tab="픽업 요청"
          name="BEFORE_APPROVE_PICKUP"
        >
          <pick-req-table />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="픽업 전"
          name="PICKUP_BEFORE"
        >
          <shipment-table :in-states="['BEFORE_ASSIGN_PICKUP']" />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="픽업 진행중"
          name="PICKUP_AFTER"
        >
          <shipment-table :in-states="['BEFORE_PICKUP', 'ONGOING_PICKUP']" />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="픽업 완료"
          name="PICKUP_Done"
        >
          <shipment-table :in-states="['PICKUP_COMPLETE', 'BEFORE_SHIP']" />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="배송 진행중"
          name="SHIPPING"
        >
          <shipment-table
            :in-states="[
              'SHIPPING',
              'SHIPPING_COMPLETE',
              'SHIPPING_PENDING',
              'SHIPPING_WAIT',
            ]"
          />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="거래완료"
          name="ORDER_DONE"
        >
          <shipment-table :in-states="['ORDER_DONE']" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
