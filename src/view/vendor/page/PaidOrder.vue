<script setup lang="ts">
import { useAuthStore } from "@/store";
import { useVendorOrderStore } from "@/store/vendorOrder";
import { onBeforeMount, ref } from "vue";
const currTab = ref<string>("BEFORE_READY");

const auth = useAuthStore();
const user = auth.currUser;
const store = useVendorOrderStore();
onBeforeMount(() => store.init(user.userInfo.userId));
</script>
<template>
  <n-space vertical align="center">
    <n-card style="width: 65vw">
      <n-tabs v-model:value="currTab">
        <n-tab-pane
          display-directive="show:lazy"
          tab="결제 완료된 주문"
          name="BEFORE_READY"
        >
          <order-by-shop-expand-table :inStates="['BEFORE_READY']" />
        </n-tab-pane>
        <n-tab-pane
          display-directive="show:lazy"
          tab="출고 리스트"
          name="BEFORE_PICKUP"
        >
          <order-by-shop-expand-table :inStates="['BEFORE_PICKUP']" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
