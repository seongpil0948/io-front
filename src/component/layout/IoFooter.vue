<script setup lang="ts">
import { useLogin } from "@/composable";
import { KAKAO_CHANNEL_ID } from "@/constants";
import {
  getMockShops,
  getMockVendors,
  getMockUncles,
} from "../../../tests/e2e/fixtures/users";

import { getCurrentInstance, ref } from "vue";
import { useRouter } from "vue-router";

const inst = getCurrentInstance();
const router = useRouter();
const isTest = process.env.VUE_APP_IS_TEST;
const { login } = useLogin();
function csChat() {
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  kakao.Channel.chat({
    channelPublicId: KAKAO_CHANNEL_ID,
  });
}
async function toVendor() {
  const uid = getMockVendors()[0];
  await login(uid, { providerId: "EMAIL" }, false);
}
async function toShop() {
  const uid = getMockShops()[0];
  await login(uid, { providerId: "EMAIL" }, false);
}
async function toUncle() {
  const uid = getMockUncles()[0];
  await login(uid, { providerId: "EMAIL" }, false);
}
const showTos = ref(false);
function onTos() {
  showTos.value = true;
}
</script>

<template>
  <n-layout-footer
    bordered
    position="fixed"
    style="
      height: 64px;
      border: none;
      font-size: smaller;
      margin-bottom: 2vh;
      background-color: transparent;
      margin-top: auto;
      padding: 12px;
    "
  >
    <n-space vertical align="center">
      <n-text depth="3">
        인아웃박스(inoutbox) | 대표: 송준회 | 주소: 서울 강남구 테헤란로 6길 16,
        1동 13층 1호
        <br />
        사업자등록번호: 720-08-02296 | 문의: inoutboxofficial@gmail.com |
        고객센터 번호 : 010-7727-7428
        <n-button text @click="onTos" size="small" type="primary">
          이용약관 보기
        </n-button>
      </n-text>
      <n-space v-if="isTest === 'true'" justify="center">
        <n-button round type="primary" @click="toVendor">도매계정전환</n-button>
        <n-button round type="primary" @click="toShop">소매계정전환</n-button>
        <n-button round type="primary" @click="toUncle">엉클계정전환</n-button>
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
    <n-modal
      v-model:show="showTos"
      style="width: 60vw; height: 60vh; overflow: auto"
      :bordered="false"
    >
      <term-of-service />
    </n-modal>
  </n-layout-footer>
</template>
