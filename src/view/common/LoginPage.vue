<script setup lang="ts">
import { lightThemeOver } from "@/composable/config";
import { lightTheme, NSpace, useMessage, useDialog } from "naive-ui";
import { LoginReturn, LoginView } from "@io-boxies/vue-lib";
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";
import { getUserName, USER_ROLE } from "@io-boxies/js-lib";
import { makeMsgOpt } from "@/util";
import { useLogger } from "vue-logger-plugin";
import { ioFire } from "@/plugin/firebase";

const msg = useMessage();
const authS = useAuthStore();
const router = useRouter();
const validRoles: USER_ROLE[] = ["SHOP", "UNCLE", "VENDOR"];
const log = useLogger();
const dialog = useDialog();
const toSignup = (data: { [k: string]: any }) =>
  dialog.success({
    title: "회원가입",
    content: "계정정보가 없습니다. 회원가입 페이지로 이동 하시겠습니까?",
    positiveText: "Wow!",
    onPositiveClick: () => {
      router.push({
        name: "SignUp",
        state: data.params as { [k: string]: any },
      });
    },
    negativeText: "nope!!",
  });

async function onLogin(data: LoginReturn | undefined) {
  console.log("LoginReturn:", data);
  if (!data) toSignup({});
  else if (data.wrongPassword) return msg.error("비밀번호가 틀렸습니다.");
  else if (data.toSignup) {
    if (data.params.providerId === "EMAIL") {
      if (!data.params.email)
        return msg.error("이메일을 입력해주세요", makeMsgOpt());
      else if (!data.params.password)
        return msg.error("비밀번호를 입력 해주세요", makeMsgOpt());
    }
    toSignup(data.params);
  } else if (!data.user)
    return msg.error("유저가 있어야 하는데 없습니다.(bug)", makeMsgOpt());
  else if (data.noConfirm && import.meta.env.MODE === "production") {
    authS.logout(false);
    return msg.error("관리자가 검토중인 계정입니다.", makeMsgOpt());
  } else if (data.user) {
    const role = data.user.userInfo.role;
    if (validRoles.includes(role)) {
      msg.success(`안녕하세요 ${getUserName(data.user)}님`, makeMsgOpt());
      authS.login(data.user);
      router.goHome();
    } else {
      const m = `유효하지 않은 유저권한입니다.`;
      msg.error(m, makeMsgOpt());
      log.warn(data.user.userInfo.userId, m, data.user);
    }
  } else {
    return msg.error("핸들링 되지 못한 에러", makeMsgOpt());
  }
}
</script>

<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="lightThemeOver">
    <n-space id="login-page-container" vertical>
      <!-- FIXME: 적당한곳에 슬롯을 만들어 내용을 추가할 수 있도록 -->
      <LoginView
        :fire-app="ioFire"
        style="max-width: 500px"
        kakao-img-other-path="/img/icon-kakao-talk-black.png"
        kakao-img-path="/img/icon-kakao-talk.png"
        logo-img-path="/logo.png"
        @on-login="onLogin"
      />
      <n-button
        size="large"
        @click="
          () =>
            router.push({
              name: 'SignUp',
            })
        "
        >회원가입</n-button
      >
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
