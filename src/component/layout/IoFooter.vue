<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
import { useLogin } from "../common/login/login";
import { ioFireStore } from "@/plugin/firebase";
import { TESTERS } from "@/constants";
import { YoutubeOutlined, AndroidOutlined, AppleOutlined } from "@vicons/antd";
import { LogoInstagram } from "@vicons/ionicons5";

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

function openTab(url: string) {
  window.open(url);
}
</script>

<template>
  <n-layout-footer
    bordered
    position="fixed"
    style="
      border: none;
      font-size: smaller;
      margin-bottom: 2vh;
      margin-top: auto;
      padding: 12px;
      border-radius: 7px;
    "
  >
    <n-space style="text-align: start">
      <n-text depth="1" style="line-height: 1.4rem">
        인아웃박스(주)대표: 송준회 <n-divider vertical /> 소재지: 서울 강남구
        테헤란로 6길 16, 1동 13층 1호 <br />
        사업자등록번호: 720-08-02296 <n-divider vertical /> 문의:
        inoutboxofficial@gmail.com <br />
        고객센터 번호: <n-divider vertical /> 010-7727-7428
        <n-button size="tiny" text @click="onTos"> 이용약관 </n-button> <br />
      </n-text>
      <n-divider vertical style="height: 100%" />
      <n-space vertical>
        <n-space>
          <n-button
            quaternary
            circle
            @click="openTab('https://www.youtube.com/@inoutbox5947/featured')"
          >
            <template #icon>
              <n-icon><YoutubeOutlined /></n-icon>
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            @click="openTab('https://www.instagram.com/inoutboxofficial/')"
          >
            <template #icon>
              <n-icon><LogoInstagram /></n-icon>
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            @click="
              openTab(
                'https://play.google.com/store/apps/details?id=com.io_box.uncle'
              )
            "
          >
            <template #icon>
              <n-icon><AndroidOutlined /></n-icon>
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            @click="
              openTab(
                'https://apps.apple.com/kr/app/io-box-uncle-work/id1639916314'
              )
            "
          >
            <template #icon>
              <n-icon><AppleOutlined /></n-icon>
            </template>
          </n-button>
        </n-space>
        <n-space v-if="!isProd">
          <n-button
            size="tiny"
            text
            @click="router.push({ name: 'PlayGround' })"
          >
            PlayGround
          </n-button>
          <n-button size="tiny" text data-test="login-shop" @click="loginShop">
            쇼핑몰
          </n-button>
          <n-button
            size="tiny"
            text
            data-test="login-vendor"
            @click="loginVendor"
          >
            도매
          </n-button>
          <n-button
            size="tiny"
            text
            data-test="login-uncle"
            @click="loginUncle"
          >
            엉클
          </n-button>
        </n-space>
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
