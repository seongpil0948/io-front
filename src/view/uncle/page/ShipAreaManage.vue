<script setup lang="ts">
// import { useAuthStore } from "@/store";
import { useAuthStore } from "@/store";
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { USER_DB, useCommon, catchError } from "@/composable";
import { ioFireStore } from "@/plugin/firebase";
import { parseCurrencyStr, formatCurrency } from "@/util";

const currTab = ref<string>("SHIP_AREA");
const { msg, makeMsgOpt } = useCommon();
const authStore = useAuthStore();
const { user: u } = storeToRefs(authStore);
async function updatePendingAmount() {
  if (u.value && u.value.uncleInfo) {
    return USER_DB.updateUser(ioFireStore, u.value)
      .then(() => {
        msg.success("업데이트 성공!", makeMsgOpt());
        authStore.setUser(u.value!);
      })
      .catch((err) =>
        catchError({
          err,
          msg,
          prefix: "업데이트 실패",
        })
      );
  }
  msg.error("유저 업데이트 실패", makeMsgOpt());
}
</script>
<template>
  <n-card title="활동지역 관리">
    <n-space item-style="width: 100%">
      <n-tabs v-model:value="currTab">
        <n-tab-pane display-directive="show:lazy" tab="공통 설정" name="COMMON">
          <n-space vertical align="start" style="min-height: 300px">
            <ship-pending-amount-tooltip type="info" />
            <n-space v-if="u && u.uncleInfo">
              <n-input-number
                v-model:value="u.uncleInfo.shipPendingAmount"
                :min="1000"
                :show-button="false"
                :parse="parseCurrencyStr"
                :format="formatCurrency"
                placeholder="기본배송보류금액"
              >
                <template #suffix> 원 </template>
              </n-input-number>
              <n-button @click="updatePendingAmount"> 수정 </n-button>
            </n-space>
          </n-space>
        </n-tab-pane>
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
          <n-space justify="center">
            <n-space vertical>
              <n-h2>사이즈별 비용</n-h2>
              <ship-unit-list :u="u" :edit="true" unit-key="amountBySize" />
            </n-space>
            <n-space vertical>
              <n-h2>중량별 비용</n-h2>
              <ship-unit-list :u="u" :edit="true" unit-key="amountByWeight" />
            </n-space>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-space>
  </n-card>
</template>
