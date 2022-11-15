<script setup lang="ts">
import { useLogin } from "@/composable";

import { ref } from "vue";
import { useRouter } from "vue-router";
import { enableStoreNet, disableStoreNet } from "@io-boxies/js-lib";
const router = useRouter();
const isTest = process.env.VUE_APP_IS_TEST;
const { login } = useLogin();
async function toVendor() {
  await login("2301651985", { providerId: "EMAIL" }, false);
}
async function toShop() {
  await login("2393044259", { providerId: "EMAIL" }, false);
}
async function toUncle() {
  await login("2419092443", { providerId: "EMAIL" }, false);
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
        <n-button @click="toVendor">도매계정전환</n-button>
        <n-button @click="toShop">소매계정전환</n-button>
        <n-button @click="toUncle">엉클계정전환</n-button>
        <!-- <<< TEMP <<< -->
        <n-button @click="router.push({ name: 'PlayGround' })">
          PlayGround
        </n-button>
        <n-button @click="enableStoreNet">enableStoreNet</n-button>
        <n-button @click="disableStoreNet">disableStoreNet</n-button>
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
