<script setup lang="ts">
import {
  ORDER_GARMENT_DB,
  OrderItem,
  useCompletePay,
  getUserName,
  IoUser,
  USER_DB,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { useAuthStore } from "@/store";
import { makeMsgOpt, useAlarm } from "@io-boxies/vue-lib";
import { NButton, useMessage } from "naive-ui";
import { Size, Type } from "naive-ui/es/button/src/interface";
import { ref, toRefs, watchEffect, computed } from "vue";
import ReceiptCard from "@/component/card/vendor/ReceiptCard.vue";
import { axiosConfig } from "@/plugin/axios";
import { ioFire, ioFireStore } from "@/plugin/firebase";
import { getAnalytics, logEvent } from "@firebase/analytics";

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
  targetShop.value = await USER_DB.getUserById(ioFireStore, ids[0]);
});

const { showModal, defrayInfo, prodAmounts, receiptRef, newCredit } =
  useCompletePay({
    items,
  });

async function completePay() {
  if (!targetShop.value) {
    return msg.error("쇼핑몰을 지정해주십시오!!");
  }
  if (props.beforePay) {
    await props.beforePay();
  }
  ORDER_GARMENT_DB.completePay(
    [...targetOrdDbIds.value],
    [...targetOrdItemIds.value],
    targetShop.value.userInfo.userId,
    auth.currUser().userInfo.userId,
    defrayInfo.value
  )
    .then(async () => {
      msg.success("결제승인 완료", makeMsgOpt());
      showModal.value = false;
      await sendAlarm({
        toUserIds: targetShopIds.value,
        subject: `inoutbox 주문 처리내역 알림.`,
        body: `${getUserName(auth.currUser())} 에서 결제를 승인 하였습니다. `,
        notiLoadUri: "/",
        uriArgs: {},
        sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
        pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
      });
      logEvent(getAnalytics(ioFire.app), "order_complete_pay", {
        approver: auth.currUser().userInfo.userId,
      });
    })
    .catch((err) => {
      const message = `결제승인 실패 ${
        err instanceof Error ? err.message : JSON.stringify(err)
      }`;
      msg.error(message, makeMsgOpt());
      logger.error(auth.currUser().userInfo.userId, message);
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
      <ReceiptCard ref="receiptRef" :customer="targetShop" :items="items" />
      <n-space v-if="showModal" vertical>
        <n-card>
          <n-space justify="space-between">
            <n-text>총 결제 금액: </n-text>
            <n-text type="info">{{ prodAmounts.toLocaleString() }} </n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text>추가 미 결제금액: </n-text>
            <n-text type="info">{{ newCredit.toLocaleString() }} </n-text>
          </n-space>
          <template #footer>
            <n-space justify="end">
              <n-button
                @click="
                  () => ($refs as any).defrayCards.forEach((e: any) => e.applyTax(true))
                "
                >부가세적용</n-button
              >
              <n-button @click="completePay">주문확정</n-button>
            </n-space>
          </template>
        </n-card>
        <div v-for="(item, i) in items" :key="i">
          <defray-info-card
            ref="defrayCards"
            v-model:defray.lazy="defrayInfo[item.id]"
            v-model:item.lazy="items[i]"
          />
        </div>
      </n-space>
    </n-space>
  </n-modal>
</template>
