<script setup lang="ts">
import { ORDER_STATE } from "@/types";
import { ref } from "vue";
import { useRouter } from "vue-router";

const currTab = ref<string>("reqOrderList");
const router = useRouter();
function onClickOrder() {
  router.push({ name: "OrderComplete" });
}
/// >>> TEMP >>>
function handleBack() {
  console.info("[onBack]");
}
const options = [
  {
    label: "More episodes",
    key: "1",
  },
  {
    label: "More episodes",
    key: "2",
  },
  {
    label: "More episodes",
    key: "3",
  },
];
/// <<< TEMP <<<
const sales = { today: 500000 };
</script>
<template>
  <!-- TEMP -->
  <n-page-header
    subtitle="는 철권을 개못하규요 피파도 졌우요"
    @back="handleBack"
  >
    <n-grid :cols="5">
      <n-gi>
        <n-statistic label="일 매출액" :value="sales.today.toLocaleString()" />
      </n-gi>
      <n-gi>
        <n-statistic
          label="주 매출액"
          :value="(sales.today * 7).toLocaleString()"
        />
      </n-gi>
      <n-gi>
        <n-statistic
          label="월 매출액"
          :value="(sales.today * 31).toLocaleString()"
        />
      </n-gi>
      <n-gi>
        <n-statistic
          label="누적 판매수량"
          :value="(5000000).toLocaleString()"
        />
      </n-gi>
    </n-grid>
    <template #title>
      <n-a
        href="https://www.naver.com/"
        style="text-decoration: none; color: inherit"
      >
        송준회
      </n-a>
    </template>
    <template #avatar>
      <n-avatar
        src="https://cdnimg103.lizhi.fm/user/2017/02/04/2583325032200238082_160x160.jpg"
      />
    </template>
    <template #extra>
      <n-space>
        <n-dropdown :options="options" placement="bottom-start">
          <n-button :bordered="false" style="padding: 0 4px"> ··· </n-button>
        </n-dropdown>
      </n-space>
    </template>
  </n-page-header>
  <!-- TEMP -->
  <n-card>
    <n-tabs v-model:value="currTab">
      <!-- FIXME: 테이블 X 가 끝까지 안가는 원인을 찾고 업데이트 해야함 -->
      <n-tab-pane
        display-directive="show:lazy"
        tab="주문 해야할 내역"
        name="reqOrderList"
      >
        <shop-add-order-table
          :showSizes="false"
          :inStates="[ORDER_STATE.BEFORE_ORDER]"
        />
      </n-tab-pane>
      <n-tab-pane
        display-directive="show:lazy"
        tab="주문 완료된 내역"
        name="afterOrderList"
      >
        <shop-order-table
          :inStates="[
            ORDER_STATE.BEFORE_APPROVE,
            ORDER_STATE.BEFORE_PAYMENT,
            ORDER_STATE.BEFORE_SHIP,
          ]"
          @clickOrder="onClickOrder"
          :showSizes="false"
        />
      </n-tab-pane>
      <n-tab-pane tab="실시간 픽업 현황" name="pickStatus"> gg </n-tab-pane>
      <n-tab-pane tab="통계" name="statistics"> gg </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
