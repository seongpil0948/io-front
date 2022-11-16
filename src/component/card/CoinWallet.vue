<script setup>
import { computed, ref } from "vue";

import { useAuthStore } from "@/store";
import { QuestionCircleRegular } from "@vicons/fa";
// import { useMessage } from "naive-ui";
// import { useLogger } from "vue-logger-plugin";
import { IoPay, useUserPay } from "@/composable";
import { Bootpay } from "@bootpay/client-js";
import { uuidv4 } from "@firebase/util";

// const log = useLogger();
const APP_ID = "62b45e0fe38c3000215aec6b";
const authStore = useAuthStore();
// const msg = useMessage();
const user = authStore.currUser;
const { userPay } = useUserPay(user.userInfo.userId);

async function reqPay() {
  const uuid = uuidv4();
  const date = new Date();
  const price = IoPay.coinToMoney(chargeCoin.value).toString();
  try {
    const response = await Bootpay.requestPayment({
      price,
      application_id: APP_ID,
      order_name: "인코인 구매",
      order_id: "charge_" + uuid, //고유 주문번호로, 생성하신 값을 보내주셔야 합니다
      uuid,
      user: {
        username: user.userInfo.userName,
        email: user.userInfo.email,
        addr: null,
        phone: null,
      },
      metadata: {
        callback1: "그대로 콜백받을 변수 1",
        customvar1234: "변수명도 마음대로",
        mey: price,
      },
      extra: {
        display_error_result: true,
        test_deposit: true,
        deposit_expiration: date
          .toLocaleDateString()
          .split(".")
          .filter((x) => x)
          .map((x) => x.trim())
          .join("-"),
      },
    });
    console.log("bootpay response ", response);
    switch (response.event) {
      case "issued":
        console.log("in issued", response);
        break;
      case "done":
        console.log("in done", response);
        // 결제 완료 처리
        break;
      case "confirm": //payload.extra.separately_confirmed = true; 일 경우 승인 전 해당 이벤트가 호출됨
        console.log("in confirm", response.receipt_id);
        // 1. 클라이언트 승인을 하고자 할때
        // validationQuantityFromServer(); //예시) 재고확인과 같은 내부 로직을 처리하기 한다.
        // const confirmedData = await Bootpay.confirm(); //결제를 승인한다
        // if (confirmedData.event === "done") {
        //   //결제 성공
        // } else if (confirmedData.event === "error") {
        //   //결제 승인 실패
        // }

        // 2. 서버 승인을 하고자 할때
        // // requestServerConfirm(); //예시) 서버 승인을 할 수 있도록  API를 호출한다. 서버에서는 재고확인과 로직 검증 후 서버승인을 요청한다.
        // Bootpay.destroy(); //결제창을 닫는다.

        break;
    }
  } catch (e) {
    console.log(e);
    switch (e.event) {
      case "cancel": // 사용자가 결제창을 닫을때 호출
        break;
      case "error":
        // 결제 승인 중 오류 발생시 호출
        console.error(e.pg_error_code, e.error_code, e.message);
        break;
    }
  }
}
const minCharge = IoPay.moneyToCoin(5000);
const chargeCoin = ref(minCharge);
const chargeString = computed(() => IoPay.toMoneyString(chargeCoin.value));
const chargeValidator = (x) => x % 10 === 0;
</script>
<template>
  <n-space vertical style="text-align: start" v-if="userPay">
    <n-h2>In-Coin 월렛</n-h2>
    <n-space justify="space-between">
      <n-text strong>코인 보유량 : </n-text>
      <n-text type="info"> {{ userPay.budget }} 코인 </n-text></n-space
    >
    <n-divider />
    <n-space justify="space-between">
      <div style="position: relative">
        <n-tooltip trigger="hover" :width="400">
          <template #trigger>
            <n-button circle text style="position: absolute; left: -30%">
              <template #icon>
                <n-icon><QuestionCircleRegular /></n-icon>
              </template>
            </n-button>
          </template>
          <template #header>보류 코인이란?</template>
          샘플요청등의 사유로 담보중인 코인 으로서 샘플반납등의 담보해제 사건을
          조건으로 정상코인으로의 이전이 가능합니다.
        </n-tooltip>
        <n-text strong>보류 코인량 : </n-text>
      </div>
      <n-text type="info"> {{ userPay.pendingBudget }} 코인 </n-text></n-space
    >
    <n-divider />
    <n-space justify="space-between">
      <n-text strong>코인충전</n-text>
      <n-input-number
        v-model:value="chargeCoin"
        :step="10"
        :validator="chargeValidator"
      />
    </n-space>
    <n-space justify="end"
      ><n-text depth="3"> 10코인 단위로 입력 </n-text></n-space
    >
    <n-space justify="space-between">
      <n-button
        v-for="m in [100, 1000, 2000, 5000, 10000, 10000].map((x) =>
          IoPay.moneyToCoin(x)
        )"
        :key="m"
        @click="chargeCoin += m"
      >
        {{ m.toLocaleString() }}
      </n-button>
    </n-space>
    <n-space justify="space-between" style="line-height: 2rem">
      <div>
        <n-text strong>결제금액 : </n-text>
        <n-text>{{ chargeString }} </n-text>
      </div>

      <n-button @click="reqPay">충전하기<coin-image size="1.6rem" /></n-button>
    </n-space>
  </n-space>
</template>
