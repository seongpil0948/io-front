<script setup>
import { IoPay, ioColors } from "@/composables";
import BootPay from "bootpay-js";
import { computed, ref, getCurrentInstance } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores";
import { QuestionCircleRegular } from "@vicons/fa";
import { useMessage } from "naive-ui";
import { useLogger } from "vue-logger-plugin";
import { IO_PAY_DB } from "@/composable";

const log = useLogger();
const APP_ID = "62b45e0fe38c3000215aec6b";
const inst = getCurrentInstance();
const authStore = useAuthStore();
const msg = useMessage();
const user = authStore.currUser;
const { userPay } = IO_PAY_DB.getIoPayByUser(user.userInfo.userId);

async function reqPay() {
  const date = new Date();
  const price = IoPay.coinToMoney(chargeCoin.value).toString();
  const response = BootPay.request({
    price, //실제 결제되는 가격
    application_id: APP_ID,
    name: "인코인 구매", //결제창에서 보여질 이름
    show_agree_window: 1, // 부트페이 정보 동의 창 보이기 여부
    user_info: {
      // TODO
      username: "사용자 이름",
      email: "seongpil0948@gmail.com",
      addr: "사용자 주소",
      phone: "010-1234-4567",
    },
    order_id: "charge" + uuidv4(), //고유 주문번호로, 생성하신 값을 보내주셔야 합니다.
    params: {
      callback1: "그대로 콜백받을 변수 1",
      customvar1234: "변수명도 마음대로",
      mey: price,
    },
    account_expire_at: date
      .toLocaleDateString()
      .split(".")
      .filter((x) => x)
      .map((x) => x.trim())
      .join("-"), // 가상계좌 입금기간 제한 ( yyyy-mm-dd 포멧으로 입력해주세요. 가상계좌만 적용됩니다. )
    extra: {
      theme: "custom", // [ red, purple(기본), custom ]
      custom_background: ioColors.primary,
    },
  })
    .error(function (data) {
      //결제 진행시 에러가 발생하면 수행됩니다.
      log.error(user.userInfo.userId, "On Payment Error", data);
      msg.error(`${data.action}, code: ${data.code}, message: ${data.message}`);
    })
    .cancel(function (data) {
      //결제가 취소되면 수행됩니다.
      log.debug(user.userInfo.userId, "On Payment Cancel", data);
    })
    .ready(function (data) {
      // 가상계좌 입금 계좌번호가 발급되면 호출되는 함수입니다.
      log.debug(user.userInfo.userId, "On Payment Ready", data);
    })
    .confirm(async function (data) {
      //결제가 실행되기 전에 수행되며, 주로 재고를 확인하는 로직이 들어갑니다.
      //주의 - 카드 수기결제일 경우 이 부분이 실행되지 않습니다.
      // 예) 현대 앱카드 인증 후 최종 결제 눌렀을때 실행됌
      // https://docs.bootpay.co.kr/rest/verify
      log.debug(user.userInfo.userId, "On Payment Confirm", data);
      const http = inst?.appContext.config.globalProperties.$http;
      const resp = await http.get(
        `/payment/verifyReceipt?price=${data.params.mey}&receiptId=${data.receipt_id}`
      );
      log.debug("/payment/verifyReceipt Response: ", resp);
      const enable = resp.data === "sp"; // 재고 수량 관리 로직 혹은 다른 처리
      if (enable) {
        BootPay.transactionConfirm(data); // 조건이 맞으면 승인 처리를 한다.
      } else {
        BootPay.removePaymentWindow(); // 조건이 맞지 않으면 결제 창을 닫고 결제를 승인하지 않는다.
      }
    })
    .close(function (data) {
      // 결제창이 닫힐때 수행됩니다. (성공,실패,취소에 상관없이 모두 수행됨)
      log.debug(user.userInfo.userId, "On Close Payment", data);
    })
    .done(async function (data) {
      // Logic after transactionConfirm(data)
      // data = {
      //   action: "BootpayDone",
      //   parent: 2,
      //   receipt_id: "62b5079a2701800020be3e2d",
      //   price: 1000,
      //   card_no: "943135*********7",
      //   card_code: "04",
      //   card_name: "현대카드",
      //   card_quota: "00",
      //   receipt_url:
      //     "https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayCARDCAEjiwob6b20220624094248093135&noMethod=1",
      //   params: {
      //     callback1: "그대로 콜백받을 변수 1",
      //     callback2: "그대로 콜백받을 변수 2",
      //     customvar1234: "변수명도 마음대로",
      //   },
      //   item_name: "블링블링 마스카라",
      //   order_id: "order_id_1234",
      //   url: "http://localhost:8080",
      //   tax_free: 0,
      //   payment_name: "ISP / 앱카드결제",
      //   pg_name: "이니시스",
      //   pg: "inicis",
      //   method: "card",
      //   method_name: "ISP / 앱카드결제",
      //   payment_group: "card",
      //   payment_group_name: "신용카드",
      //   requested_at: "2022-06-24 09:38:50",
      //   purchased_at: "2022-06-24 09:42:49",
      //   status: 1,
      // };
      log.debug("On Payment Done", data);
      const coin = IoPay.moneyToCoin(data.price);
      userPay.value.budget += coin;
      await userPay.value.update();
    });
  log.debug(user.userInfo.userId, "REsponse data: ", response);
}
const minCharge = 50;
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
      <!-- <n-input-number
        v-model:value="chargeCoin"
        :min="minCharge"
        :step="10"
        :validator="chargeValidator"
      /> -->
    </n-space>
    <n-space justify="end"
      ><n-text depth="3"> 10코인 단위로 입력 </n-text></n-space
    >
    <n-space justify="space-between">
      <n-button
        v-for="m in [100, 1000, 5000, 10000]"
        :key="m"
        @click="chargeCoin += m"
      >
        {{ m.toLocaleString() }}
      </n-button>
    </n-space>
    <n-space justify="space-between" style="line-height: 2rem">
      <div>
        <n-text strong>금액 : </n-text>
        <n-text>{{ chargeString }} </n-text>
      </div>

      <n-button @click="reqPay">결제하기<coin-image size="1.6rem" /></n-button>
    </n-space>
  </n-space>
</template>
