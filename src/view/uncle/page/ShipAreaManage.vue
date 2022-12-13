<script setup lang="ts">
// import { useAuthStore } from "@/store";
import { useAuthStore } from "@/store";
import { ref } from "vue";
import { storeToRefs } from "pinia";

const currTab = ref<string>("SHIP_AREA");
const authStore = useAuthStore();
const { user: u } = storeToRefs(authStore);
</script>
<template>
  <n-card>
    <n-space item-style="width: 100%">
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
          <n-space vertical justify="center" align="center">
            <n-h2>사이즈별 비용</n-h2>
            <ship-unit-list :u="u" :edit="true" unit-key="amountBySize" />
            <div style="height: 1vh" />
            <n-h2>중량별 비용</n-h2>
            <ship-unit-list :u="u" :edit="true" unit-key="amountByWeight" />
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-space>
  </n-card>
</template>
