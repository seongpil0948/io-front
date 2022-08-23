<script setup lang="ts">
// import { useAuthStore } from "@/store";
import { ref } from "vue";
// const auth = useAuthStore();
// const u = auth.currUser;
const currTab = ref<string>("SHIP_AREA");
</script>
<template>
  <n-card>
    <n-space vertical align="center" justify="center">
      <n-h1>활동지역 관리</n-h1>
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          display-directive="show:lazy"
          tab="배송 지역 설정"
          name="SHIP_AREA"
        >
          <ship-area-table />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="픽업 지역 설정"
          name="PICK_AREA"
        >
          <pick-area-table />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="배송료 설정"
          name="SHIP_FEE"
        >
          <n-space vertical>
            <n-h2>사이즈별 비용</n-h2>
            <ship-unit-list unitKey="amountBySize" />
            <div style="height: 1vh"></div>
            <n-h2>중량별 비용</n-h2>
            <ship-unit-list unitKey="amountByWeight" />
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-space>
  </n-card>
</template>
