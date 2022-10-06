<script setup lang="ts">
import { ref } from "vue";

const currTab = ref("RETURN_REQ");
</script>
<template>
  <n-h2>교환/반품관리</n-h2>

  <n-tabs v-model:value="currTab">
    <n-tab-pane display-directive="show:lazy" tab="교환/반품" name="RETURN_REQ">
      <vendor-order-by-shop-table
        :showPaidDate="true"
        :inStates="['RETURN_REQ']"
      />
    </n-tab-pane>
    <n-tab-pane display-directive="show:lazy" tab="취소/수정" name="CANCEL">
      <vendor-order-table :showPaidDate="true" :inStates="['CANCEL']" />
    </n-tab-pane>
  </n-tabs>
</template>
