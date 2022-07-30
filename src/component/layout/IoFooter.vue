<script setup lang="ts">
import { IoUser } from "@/composable";
import { KAKAO_CHANNEL_ID } from "@/constants";
import { useAuthStore } from "@/store";
import {
  getMockShops,
  getMockVendors,
} from "../../../tests/e2e/fixtures/users";

import { getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

const inst = getCurrentInstance();
const router = useRouter();
const auth = useAuthStore();
const isTest = process.env.VUE_APP_IS_TEST;
function csChat() {
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  kakao.Channel.chat({
    channelPublicId: KAKAO_CHANNEL_ID,
  });
}
async function toVendor() {
  const u = IoUser.fromJson(getMockVendors()[0])!;
  // await u.update();
  await auth.login(u);
  router.goHome(auth.user!);
}
async function toShop() {
  const u = IoUser.fromJson(getMockShops()[0])!;
  // await u.update();
  auth.login(u);
  router.goHome(auth.user!);
}
</script>

<template>
  <n-layout-footer
    bordered
    position="fixed"
    style="
      height: 64px;
      padding: 24px;
      border: none;
      font-size: smaller;
      padding-bottom: 1vh;
    "
  >
    <n-space vertical align="center">
      <n-text depth="3">
        인아웃박스(inoutbox) | 대표: 송준회 | 주소: 서울 강남구 테헤란로 6길 16,
        1동 13층 1호
        <br />
        사업자등록번호: 720-08-02296 | 문의: inoutboxofficial@gmail.com
      </n-text>
      <n-space v-if="isTest" justify="center">
        <n-button round type="primary" @click="toVendor">도매계정전환</n-button>
        <n-button round type="primary" @click="toShop">소매계정전환</n-button>
        <!-- <<< TEMP <<< -->
        <n-button round type="primary" @click="csChat">채팅 상담</n-button>
        <n-button
          round
          type="primary"
          @click="router.push({ name: 'OrderLinkage' })"
          >주문연동</n-button
        >
      </n-space>
    </n-space>
  </n-layout-footer>
</template>
