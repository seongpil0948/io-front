<script setup lang="ts">
import { ORDER_GARMENT_DB, OrderItem, useCompletePay } from "@/composable";
import { logger } from "@/plugin/logger";
import { useAuthStore } from "@/store";
import { getUserName, IoUser, USER_DB } from "@io-boxies/js-lib";
import { makeMsgOpt, useAlarm } from "@io-boxies/vue-lib";
import { NButton, useMessage } from "naive-ui";
import { Size, Type } from "naive-ui/es/button/src/interface";
import { ref, toRefs, watchEffect, computed } from "vue";
import ReceiptCard from "@/component/card/vendor/ReceiptCard.vue";
import { payMethodOpts } from "@/util";
const props = defineProps<{
  targetOrdDbIds: string[];
  items: OrderItem[];
  targetShopIds: string[];
  buttonText: string;
  buttonClass?: string;
  isText?: boolean;
  type?: Type;
  size?: Size;
  beforePay?: () => Promise<void>;
}>();
const { items, targetShopIds, buttonText, buttonClass, targetOrdDbIds } =
  toRefs(props);
const targetOrdItemIds = computed(() => items.value.map((x) => x.id));

const msg = useMessage();
const { sendAlarm } = useAlarm();
const auth = useAuthStore();
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

const {
  payMethod,
  showModal,
  tax,
  paidAmount,
  orderAmounts,
  receiptRef,
  onPrint,
} = useCompletePay({ items });

async function applyCredit() {
  console.log("applyCredit");
}

async function completePay() {
  if (props.beforePay) {
    await props.beforePay();
  }
  ORDER_GARMENT_DB.completePay(
    [...targetOrdDbIds.value],
    [...targetOrdItemIds.value],
    {
      // tax: tax.value ? Math.round(orderAmount / 100) * 10 : 0,
      tax: 0,
      payMethod: payMethod.value,
      paidAmount: paidAmount.value,
    }
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
      <ReceiptCard
        ref="receiptRef"
        :customer="targetShop"
        :vendor="auth.currUser"
      />
      <n-space vertical>
        <n-space>
          <n-button @click="onPrint">출력하기</n-button>
          <n-button @click="tax = !tax"
            >부가세 {{ tax ? "해제" : "적용" }}</n-button
          >
          <n-button @click="applyCredit">미결제금액 적용</n-button>
        </n-space>

        <n-text>결제방식</n-text>
        <n-select
          v-model:value="payMethod"
          :options="payMethodOpts"
          placeholder="결제방식"
        />
        <n-text>총 결제 금액: {{ orderAmounts }}</n-text>

        <n-text>받은금액</n-text>
        <n-input-number
          v-model:value="paidAmount"
          :step="10"
          :show-button="false"
        />
      </n-space>
    </n-space>
    <template #footer>
      <n-space justify="end">
        <n-button @click="completePay">주문확정</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
