<script setup lang="ts">
import { lightThemeOver } from "@/composable/config";
import { lightTheme, NSpace, useMessage } from "naive-ui";
import { LoginReturn } from "@io-boxies/vue-lib";
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";
import { getUserName, USER_ROLE } from "@io-boxies/js-lib";
import { makeMsgOpt } from "@/util";
import { useLogger } from "vue-logger-plugin";
import { axiosConfig } from "@/plugin/axios";
import { ioFireStore } from "@/plugin/firebase";
import { defineAsyncComponent } from "vue";

const LoginView = defineAsyncComponent(
  () => import("@/component/common/login/login-view")
);

const msg = useMessage();
const authS = useAuthStore();
const router = useRouter();
const validRoles: USER_ROLE[] = ["SHOP", "UNCLE", "VENDOR"];
const log = useLogger();

async function onLogin(data: LoginReturn | undefined) {
  console.log("LoginReturn:", data);
  if (!data) return msg.error("문제가 발생했습니다. 문의 주세요..!");
  else if (data.wrongPassword) return msg.error("비밀번호가 틀렸습니다.");
  else if (data.toSignup) {
    if (data.params.providerId === "EMAIL") {
      if (!data.params.email)
        return msg.error("이메일을 입력해주세요", makeMsgOpt());
      else if (!data.params.password)
        return msg.error("비밀번호를 입력 해주세요", makeMsgOpt());
    }
    router.push({
      name: "SignUp",
      state: data.params as { [k: string]: any },
    });
  } else if (!data.user)
    return msg.error("유저가 있어야 하는데 없습니다.(bug)", makeMsgOpt());
  else if (data.noConfirm) {
    authS.logout(false);
    return msg.error("관리자가 검토중인 계정입니다.", makeMsgOpt());
  } else if (data.user) {
    const role = data.user.userInfo.role;
    if (validRoles.includes(role)) {
      msg.success(`안녕하세요 ${getUserName(data.user)}님`, makeMsgOpt());
      authS.login(data.user);
      router.goHome(data.user);
    } else {
      const m = `유효하지 않은 유저권한입니다.`;
      msg.error(m, makeMsgOpt());
      log.warn(data.user.userInfo.userId, m, data.user);
    }
  } else {
    return msg.error("핸들링 되지 못한 에러", makeMsgOpt());
  }
}
const env = import.meta.env.MODE === "production" ? "io-prod" : "io-dev";

function onInternalError(err: any) {
  if (err.code === "auth/custom-token-mismatch") {
    const msgStr =
      "인증과정에서 auth/custom-token-mismatch 에러가 발생했습니다.";
    msg.error(msgStr);
    log.error(null, msgStr);
  } else {
    console.log(`code: ${err.code}, message: ${err.message}`, err);
  }
}
console.log("ioFireStore: ", ioFireStore);
</script>

<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="lightThemeOver">
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
      />
      <forget-password-btn />
      <io-footer />
    </n-space>
  </n-config-provider>
</template>

<style>
#login-page-container {
  justify-content: center !important;
  text-align: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
}
.n-h {
  text-align: center;
}
.text-login-btn {
  max-height: 3vw !important;
  width: 10vw;
  min-height: 32px;
  min-width: 100px;
}
</style>
