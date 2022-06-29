<script setup lang="ts">
import { useAuthStore } from "@/stores";
import { onBeforeMount } from "vue";
import { IoUser } from "@/composables";
// >>> TEMP >>>
import shops from "../../../tests/e2e/fixtures/users/shops";
import vendors from "../../../tests/e2e/fixtures/users/vendors";
import { useRouter } from "vue-router";
const auth = useAuthStore();
const router = useRouter();
onBeforeMount(() => {
  if (!auth.$state.user) {
    const user = IoUser.fromJson(shops[0]) ?? IoUser.fromJson(vendors[0]);
    if (user) {
      auth.login(user);
    }
  }
});
async function toVendor() {
  await auth.login(IoUser.fromJson(vendors[0])!);
  router.goHome(auth.user!);
}
async function toShop() {
  auth.login(IoUser.fromJson(shops[0])!);
  router.goHome(auth.user!);
}
// <<< TEMP <<<
</script>

<template>
  <n-layout-footer
    class="io-bacground"
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
    <!-- >>> TEMP >>> -->
    <n-button round type="primary" @click="toVendor">도매계정전환</n-button>
    <n-button round type="primary" @click="toShop">소매계정전환</n-button>
    <!-- <<< TEMP <<< -->
  </n-layout-footer>
</template>
