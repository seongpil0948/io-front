<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
import { useLogin } from "../common/login/login";
import { ioFireStore } from "@/plugin/firebase";
import { TESTERS } from "@/constants";
const router = useRouter();
const showTos = ref(false);
function onTos() {
  showTos.value = true;
}
const authS = useAuthStore();
const isProd = import.meta.env.MODE === "production";
const { emailLogin } = useLogin(
  isProd ? "io-prod" : "io-dev",
  "/auth/customToken"
);
async function loginTester(d: { id: string; pw: string }) {
  const data = await emailLogin(ioFireStore, d.id, d.pw);
  if (data && data.user) {
    authS.login(data.user);
    router.goHome();
  }
}
const loginShop = () => loginTester(TESTERS.SHOP);
const loginVendor = () => loginTester(TESTERS.VENDOR);
const loginUncle = () => loginTester(TESTERS.UNCLE);
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
        <n-button size="small" @click="onTos"> 이용약관 보기 </n-button>
      </n-text>
      <n-space v-if="!isProd" justify="center">
        <!-- <<< TEMP <<< -->
        <n-button @click="router.push({ name: 'PlayGround' })">
          PlayGround
        </n-button>
        <n-button @click="loginShop"> 쇼핑몰 </n-button>
        <n-button @click="loginVendor"> 도매 </n-button>
        <n-button @click="loginUncle"> 엉클 </n-button>
      </n-space>
    </n-space>
    <n-modal
      v-model:show="showTos"
      style="width: 90vw; height: 80vh; overflow: auto"
      :bordered="false"
    >
      <term-of-service />
    </n-modal>
  </n-layout-footer>
</template>
