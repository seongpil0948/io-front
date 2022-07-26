<script setup lang="ts">
import { KAKAO_CHANNEL_ID } from "@/constants";
import { getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

const inst = getCurrentInstance();
const router = useRouter();
function csChat() {
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  kakao.Channel.chat({
    channelPublicId: KAKAO_CHANNEL_ID,
  });
}
</script>

<template>
  <n-layout-footer
    class="io-background"
    bordered
    position="fixed"
    style="height: 64px; padding: 24px; border: none; font-size: smaller"
  >
    <n-text depth="3">
      인아웃박스(inoutbox) | 대표: 송준회 | 주소: 서울 강남구 테헤란로 6길 16,
      1동 13층 1호
      <br />
      사업자등록번호: 720-08-02296 | 문의: inoutboxofficial@gmail.com
    </n-text>
    <n-button round type="primary" @click="csChat">채팅 상담</n-button>
    <n-button
      round
      type="primary"
      @click="router.push({ name: 'OrderLinkage' })"
      >주문연동</n-button
    >
  </n-layout-footer>
</template>
