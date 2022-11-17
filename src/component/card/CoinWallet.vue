<script setup lang="ts">
import { computed, getCurrentInstance, ref } from "vue";

import { useAuthStore } from "@/store";
import { QuestionCircleRegular } from "@vicons/fa";
import { IoPay, useUserPay } from "@/composable";
import { Bootpay } from "@bootpay/client-js";
import { uuidv4 } from "@firebase/util";
import { useLogger } from "vue-logger-plugin";
import { useMessage } from "naive-ui";

const inst = getCurrentInstance();
const APP_ID = "62b45e0fe38c3000215aec6b";
const authStore = useAuthStore();
const user = authStore.currUser;
const { userPay } = useUserPay(user.userInfo.userId);
const log = useLogger();
const uid = user.userInfo.userId;
const msg = useMessage();

async function reqPay() {
  const uuid = uuidv4();
  const date = new Date();
  const price = IoPay.coinToMoney(chargeCoin.value);
  const data = {
    price: price,
    application_id: APP_ID,
    order_name: "order-in-coin",
    order_id: "charge_" + uuid, //고유 주문번호로, 생성하신 값을 보내주셔야 합니다
    uuid,
    user: {
      username: user.userInfo.userName,
      email: user.userInfo.email,
      addr: "",
      phone: user.userInfo.phone ?? "",
    },
    metadata: {
      callback1: "그대로 콜백받을 변수 1",
      customvar1234: "변수명도 마음대로",
      m: ee(price),
    },
    extra: {
      separately_confirmed: true, // 승인(done) 전 서버확인(confirm) 이벤트가 호출됨
      display_error_result: true,
      test_deposit: true,
      deposit_expiration: date
        .toLocaleDateString()
        .split(".")
        .filter((x) => x)
        .map((x) => x.trim())
        .join("-"),
    },
  };
  try {
    const resp = await Bootpay.requestPayment(data);
    console.log("bootpay resp ", resp);
    const pre = "in Bootpay.requestPayment >";
    if (resp.event === "issued") {
      log.warn(uid, pre + "issued");
    } else if (resp.event === "confirm") {
      console.log("in confirm", resp.receipt_id, "\n", resp.order_id);
      const http = inst?.appContext.config.globalProperties.$http;
      if (!http) {
        return log.error(uid, pre + "confirm, $http is null");
      }
      const verifyResp = await http.get(
        `/payment/verifyReceipt?price=${data.price}&receiptId=${resp.receipt_id}&order_id=${resp.order_id}`
      );
      console.log(null, "/payment/verifyReceipt Response: ", verifyResp);
      const ok = verifyResp.data === "sp"; // 재고 수량 관리 로직 혹은 다른 처리
      if (ok) {
        const confirmedResp = await Bootpay.confirm(); //결제를 승인한다
        console.log("confirmedResp", confirmedResp);
        if (confirmedResp.event === "done") {
          fillCoin(confirmedResp.data);
        } else if (confirmedResp.event === "error") {
          log.error(uid, "error in confirmedResp: ", confirmedResp);
        } else if (resp.event === "issued") {
          log.debug(null, pre + "issued: ", confirmedResp.data);
          console.log("bank: ", confirmedResp.data.vbank_data);
        }
      } else {
        Bootpay.destroy(); //결제창을 닫는다.
      }
    } else {
      console.error("unexpected response : ", resp);
    }
  } catch (e: any) {
    console.log(e);
    if (e.event === "error") {
      // case "cancel": // 사용자가 결제창을 닫을때 호출
      log.error(
        null,
        `pg_error_code: ${e.pg_error_code} \n e.error_code: ${e.error_code} \n e.message: ${e.message}`
      );
    }
    Bootpay.destroy(); //결제창을 닫는다.
  }
}

const fillCoin = (data: any) => {
  const price = data.price;
  const dPrice = dd(Number(data.metadata.m));
  console.log("data:", data, "\n userPay: ", userPay.value);
  console.assert(price === dPrice, "invalid price in coin");
  const coin = IoPay.moneyToCoin(price);
  if (!userPay.value) {
    return log.error(
      uid,
      `userPay is null in fillCoin, required charge coin is: ${coin}`
    );
  }
  userPay.value.budget += coin;
  userPay.value
    .update()
    .then(() => {
      msg.info("충전완료!");
    })
    .catch(() => {
      msg.error("충전실패!");
    });
};
const minCharge = IoPay.moneyToCoin(5000);
const chargeCoin = ref(minCharge);
const chargeString = computed(() => IoPay.toMoneyString(chargeCoin.value));
const chargeValidator = (x: number) => x % 10 === 0;

const zz = 1224512435;
const hh = 234567890987654;
const ee = (p: number) => (Number(p) + zz) ^ hh;
const dd = (p: number) => (Number(p) ^ hh) - zz;
</script>
<template>
  <n-space v-if="userPay" vertical style="text-align: start">
    <n-h2>In-Coin 월렛</n-h2>
    <n-space justify="space-between">
      <n-text strong> 코인 보유량 : </n-text>
      <n-text type="info"> {{ userPay.budget }} 코인 </n-text>
    </n-space>
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
          <template #header> 보류 코인이란? </template>
          샘플요청등의 사유로 담보중인 코인 으로서 샘플반납등의 담보해제 사건을
          조건으로 정상코인으로의 이전이 가능합니다.
        </n-tooltip>
        <n-text strong> 보류 코인량 : </n-text>
      </div>
      <n-text type="info"> {{ userPay.pendingBudget }} 코인 </n-text>
    </n-space>
    <n-divider />
    <n-space justify="space-between">
      <n-text strong> 코인충전 </n-text>
      <n-input-number
        v-model:value="chargeCoin"
        :step="10"
        :validator="chargeValidator"
      />
    </n-space>
    <n-space justify="end">
      <n-text depth="3"> 10코인 단위로 입력 </n-text>
    </n-space>
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
        <n-text strong> 결제금액 : </n-text>
        <n-text>{{ chargeString }} </n-text>
      </div>

      <n-button @click="reqPay">
        충전하기<coin-image size="1.6rem" />
      </n-button>
    </n-space>
  </n-space>
</template>
