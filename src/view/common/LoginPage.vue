<script setup lang="ts">
import { lightThemeOver, useNaiveConfig } from "@/composable/config";
import { lightTheme, NSpace, useMessage } from "naive-ui";
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";
import { getUserName, USER_ROLE } from "@io-boxies/js-lib";
import { makeMsgOpt } from "@/util";
import { useLogger } from "vue-logger-plugin";
import { axiosConfig } from "@/plugin/axios";
import { ioFireStore } from "@/plugin/firebase";
import { defineAsyncComponent } from "vue";
import { LoginReturn } from "@/component/common/login/login";

const LoginView = defineAsyncComponent(
  () => import("@/component/common/login/login-view")
);
const { naiveLocate } = useNaiveConfig();

const msg = useMessage();
const authS = useAuthStore();
const router = useRouter();
const validRoles: USER_ROLE[] = ["SHOP", "UNCLE", "VENDOR"];
const log = useLogger();

async function onLogin(data: LoginReturn | undefined) {
  console.log("LoginReturn:", data);
  if (!data) return msg.error("문제가 발생했습니다. 문의 주세요..!");
  else if (data.wrongPassword) return msg.error("비밀번호가 틀렸습니다.");
  else if (data.userNotFound) return msg.error("존재하지 않는 유저입니다.");
  else if (data.noConfirm) return msg.error("관리자가 검토중인 계정입니다.");
  else if (data.user) {
    const role = data.user.userInfo.role;
    if (validRoles.includes(role)) {
      msg.success(`안녕하세요 ${getUserName(data.user)}님`, makeMsgOpt());
      authS.login(data.user);
      router.goHome(data.user);
    } else {
      const m = `서비스 사용 불가 유저권한입니다.`;
      msg.error(m, makeMsgOpt());
      log.warn(data.user.userInfo.userId, m, data.user);
    }
  }
}
const env = import.meta.env.MODE === "production" ? "io-prod" : "io-dev";
const onInternalError = (err: any) =>
  log.error(null, `code: ${err.code}, message: ${err.message}`, err);
</script>
<template>
  <n-config-provider
    :locale="naiveLocate.naiveLocale"
    :date-locale="naiveLocate.naiveDate"
    :theme="lightTheme"
    :theme-overrides="lightThemeOver"
  >
    <n-space id="login-page-container" vertical>
      <LoginView
        :store="ioFireStore"
        :env="env"
        :custom-token-url="`${axiosConfig.baseURL}/auth/customToken`"
        style="max-width: 500px"
        kakao-img-other-path="/img/icon-kakao-talk-black.png"
        kakao-img-path="/img/icon-kakao-talk.png"
        logo-img-path="/logo.png"
        @on-login="onLogin"
        @on-internal-error="onInternalError"
        @to-sign-up="() => router.push({ name: 'SignUp' })"
      />
      <forget-password-btn />
    </n-space>
    <io-footer />
  </n-config-provider>
</template>
<style>
#login-page-container {
  justify-content: center !important;
  text-align: center;
  align-items: center;
  min-height: 95vh;
  width: 100%;
}
.n-h {
  text-align: center;
}
</style>
