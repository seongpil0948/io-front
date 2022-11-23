<script setup lang="ts">
import { ORDER_GARMENT_DB } from "@/composable";
import { logger } from "@/plugin/logger";
import { useAuthStore } from "@/store";
import { formatDate, getUserName, IoUser, USER_DB } from "@io-boxies/js-lib";
import { makeMsgOpt, useAlarm } from "@io-boxies/vue-lib";
import { Instagram } from "@vicons/fa";
import { NButton, useMessage } from "naive-ui";
import { Size, Type } from "naive-ui/es/button/src/interface";
import { ref, toRefs, watchEffect } from "vue";

const props = defineProps<{
  targetOrdDbIds: string[];
  targetOrdItemIds: string[];
  targetShopIds: string[];
  buttonText: string;
  buttonClass?: string;
  isText?: boolean;
  type?: Type;
  size?: Size;
}>();
const {
  targetOrdDbIds,
  targetOrdItemIds,
  targetShopIds,
  buttonText,
  buttonClass,
} = toRefs(props);
const msg = useMessage();
const { sendAlarm } = useAlarm();
const auth = useAuthStore();
// TODO: 주문건 합치기 기능 어떨까..?
const targetShop = ref<IoUser | null | undefined>(undefined);
watchEffect(async () => {
  const ids = targetShopIds.value;
  if (ids?.length < 1) {
    targetShop.value = null;
    return;
  } else if (targetShop.value && targetShop.value.userInfo.userId === ids[0])
    return;
  targetShop.value = await USER_DB.getUserById(ids[0]);
});

const showModal = ref(false);
function completePay() {
  ORDER_GARMENT_DB.completePay(
    [...targetOrdDbIds.value],
    [...targetOrdItemIds.value]
  )
    .then(async () => {
      msg.success("결제승인 완료", makeMsgOpt());
      showModal.value = false;
      await sendAlarm({
        toUserIds: targetShopIds.value,
        subject: `inoutbox 주문 처리내역 알림.`,
        body: `${getUserName(auth.currUser)} 에서 결제를 승인 하였습니다. `,
        notiLoadUri: "/",
        uriArgs: {},
      });
    })
    .catch((err) => {
      const message = `결제승인 실패 ${
        err instanceof Error ? err.message : JSON.stringify(err)
      }`;
      msg.error(message, makeMsgOpt());
      logger.error(auth.currUser.userInfo.userId, message);
    });
}

async function applyVat() {
  console.log("applyCredit");
}
async function applyCredit() {
  console.log("applyCredit");
}
async function selectPrinter() {
  console.log("selectPrinter");
}
async function onPrint() {
  console.log("onPrint ");
  const card = document.getElementById("receipt-card");
  const html = document.querySelector("html");
  if (!card || !html) return msg.error("다시 시도 해주세요.");
  const printContents = card.innerHTML;
  const printDiv = document.createElement("DIV");
  printDiv.className = "print-div";

  html.appendChild(printDiv);
  printDiv.innerHTML = printContents;
  document.body.style.display = "none";
  window.print();
  document.body.style.display = "block";
  printDiv.style.display = "none";
}
</script>

<template>
  <n-button
    :size="size"
    :type="type"
    :text="isText"
    :class="buttonClass"
    @click="showModal = true"
    >{{ buttonText }}</n-button
  >
  <n-modal
    v-model:show="showModal"
    style="width: 90vw"
    preset="card"
    size="huge"
  >
    <n-space justify="space-around">
      <n-card id="receipt-card">
        <n-space vertical align="end">
          <n-text> {{ formatDate(new Date(), "MIN") }}</n-text>
          <n-text v-if="targetShop">
            {{ getUserName(targetShop) }} 귀하
          </n-text>
        </n-space>
        <n-divider class="black-divider" />
        <n-h2 class="center-txt">{{ getUserName(auth.currUser) }}</n-h2>
        <n-h4 class="center-txt">주문 영수증</n-h4>
        <n-divider class="black-divider" />
        <n-space vertical align="start" item-style="width: 100%">
          <n-text>hp: 010-7184-0948</n-text>
          <n-text>tel: 010-7727-7428</n-text>
          <n-text>kakao: fuckjunhai</n-text>
          <n-text><n-icon :component="Instagram" />: fuckjunhai</n-text>
          <n-text
            >메모: <br />메모 메모 항헹홍행홍 <br />메모 메모 항헹홍행홍
            <br />메모 메모 항헹홍행홍
          </n-text>
          <n-space vertical align="center">
            <img
              style="width: 20vw"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
            />
            <table>
              <thead>
                <tr>
                  <th colspan="2">The table header</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>The table body</td>
                  <td>with two columns</td>
                </tr>
                <tr>
                  <td>The table body</td>
                  <td>with two columns</td>
                </tr>
                <tr>
                  <td>The table body</td>
                  <td>with two columns</td>
                </tr>
              </tbody>
            </table>
          </n-space>

          <n-divider class="black-divider" />
          <n-space justify="space-between">
            <n-text type="info">수량합계</n-text><n-text>15</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text type="info">부가세</n-text><n-text>5,000</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text type="info">금액 합계</n-text><n-text>75,000</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text type="info">미결제 금액</n-text><n-text>120,000</n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text type="info">총 결제 금액</n-text><n-text>200,000</n-text>
          </n-space>
          <n-divider class="black-divider" />
        </n-space>
      </n-card>
      <n-space vertical>
        <n-space>
          <n-button @click="selectPrinter">프린터기 선택</n-button>
          <n-button @click="onPrint">출력하기</n-button>
        </n-space>
        <n-space>
          <n-button @click="applyVat">부가세 적용</n-button>
          <n-button @click="applyCredit">미결제금액 적용</n-button>
        </n-space>
      </n-space>
    </n-space>
    <template #footer>
      <n-space justify="end">
        <n-button @click="completePay">주문확정</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style>
#receipt-card {
  width: 45vw;
  height: 80vh;
  overflow: auto;
}
.black-divider {
  border-top: 1px solid black;
}
</style>
