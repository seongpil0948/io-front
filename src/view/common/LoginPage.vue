<script setup lang="ts">
import { lightThemeOver } from "@/composable/config";
import { useLogin } from "@/composable";
import { lightTheme } from "naive-ui";

const { onKakaoLogin, googleLogin } = useLogin();
</script>

<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="lightThemeOver">
    <n-space id="login-page-container" vertical>
      <n-image src="/logo.png" width="100" />
      <n-h2>In-Out Box</n-h2>
      <n-image
        preview-disabled
        @click="googleLogin"
        src="/img/google_login.png"
        style="cursor: pointer; width: 300px; height: 50px"
      />
      <n-image
        preview-disabled
        @click="() => onKakaoLogin('login')"
        src="/img/kakao_login_medium_wide.png"
        style="cursor: pointer"
      />
      <n-button
        color="rgba(255, 255, 47, 0.7)"
        @click="() => onKakaoLogin('loginForm')"
      >
        다른계정으로 로그인
      </n-button>
    </n-space>
    <io-footer />
  </n-config-provider>
</template>

<style>
#login-page-container {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
}
</style>
