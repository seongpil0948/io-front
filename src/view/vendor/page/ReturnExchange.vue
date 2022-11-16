<script setup lang="ts">
import { ref } from "vue";

const currTab = ref("RETURN_REQ");
</script>
<template>
  <n-card>
    <n-h2>교환/반품관리</n-h2>

    <n-tabs v-model:value="currTab">
      <n-tab-pane
        display-directive="show:lazy"
        tab="교환/반품"
        name="RETURN_REQ"
      >
        <vendor-order-by-shop-table
          :show-paid-date="true"
          :in-states="['RETURN_REQ']"
        />
      </n-tab-pane>
      <n-tab-pane display-directive="show:lazy" tab="취소/수정" name="CANCEL">
        <vendor-order-table :show-paid-date="true" :in-states="['CANCEL']" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
