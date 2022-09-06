<script setup lang="ts">
import { getCurrentInstance } from "vue";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { useLogger } from "vue-logger-plugin";
import { useEventListener } from "@/util";
import { KAKAO_CHANNEL_ID } from "@/constants";
import { IoUser, USER_DB, USER_PROVIDER } from "@/composable";

const log = useLogger();
const inst = getCurrentInstance();
const router = useRouter();
const auth = getAuth();
const authS = useAuthStore();
const msg = useMessage();

useEventListener(
  () => document.querySelector("#loginForm"),
  "keyup",
  async (evt: KeyboardEvent) => {
    if (evt.key === "Enter") {
      await onKakaoLogin("loginForm");
    }
  }
);
async function onKakaoLogin(auto: "loginForm" | "login") {
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  // kakao.Auth.login({
  kakao.Auth[auto]({
    // with auto login
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    success: (obj: any) => {
      kakao.API.request({
        url: "/v2/user/me",
        success: async function (res: any) {
          const http = inst?.appContext.config.globalProperties.$http;
          const customRes = await http.get(`/auth/customToken/${res.id}`); // kakao id
          signInWithCustomToken(auth, customRes.data.token)
            .then(async (uc) => {
              kakao.API.request({
                url: "/v1/api/talk/channels",
                success: function (res: any) {
                  const ioChannel = (res.channels as any[]).find(
                    (x) => x.channel_public_id === KAKAO_CHANNEL_ID
                  );
                  if (!ioChannel) {
                    kakao.Channel.addChannel({
                      channelPublicId: KAKAO_CHANNEL_ID,
                    });
                  }
                },
                fail: function (error: any) {
                  log.error(null, "카카오 채널목록 에러: ", error);
                },
              });

              const user = await USER_DB.getUserById(uc.user.uid);
              log.debug("User from getUserById: ", user, "Uid: ", uc.user.uid);
              if (user) {
                const token = await IoUser.getFcmToken();
                if (!user.userInfo.fcmTokens.includes(token)) {
                  user.userInfo.fcmTokens.push(token);
                }

                await user.update();
                if (user.userInfo.passed) {
                  authS.login(user);
                } else {
                  msg.error("관리자가 검토중인 계정입니다.");
                  authS.logout();
                }
              } else {
                router.push({
                  name: "SignUp",
                  params: {
                    userId: uc.user.uid,
                    userName: uc.user.displayName,
                    email: res.kakao_account.email,
                    profileImg: res.properties.profile_image,
                    providerId: USER_PROVIDER.KAKAO,
                  },
                });
              }
            })
            .catch((error) => {
              if (error.code) {
                throw new Error(
                  `===> Kakao signInWithCustomToken Error Code: ${error.code},  ${error.message}`
                );
              } else {
                throw error;
              }
            });
        },
        fail: function (error: any) {
          throw new Error(
            "login success, but failed to request user information: " +
              JSON.stringify(error)
          );
        },
      });
    },
    fail: function (err: any) {
      alert(JSON.stringify(err));
    },
  });
}
</script>

<template>
  <n-space id="login-page-container" vertical>
    <n-image src="/logo.png" width="100" />
    <n-h2>In-Out Box</n-h2>
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
    <io-footer />
  </n-space>
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
