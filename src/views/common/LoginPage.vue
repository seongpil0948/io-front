<script setup lang="ts">
import { getCurrentInstance } from "vue";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useRouter } from "vue-router";
import { useEventListener } from "@/composables/event";
import { useAuthStore } from "@/stores";
import { getUserById } from "@/plugins/firebase";
import { USER_PROVIDER } from "@/types";
import { useMessage } from "naive-ui";
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
      await onKakaoLogin();
    }
  }
);
async function onKakaoLogin() {
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  console.log("kakao: ", kakao);
  kakao.Auth.login({
    success: (obj: any) => {
      console.log("Login Response:", obj);
      kakao.API.request({
        url: "/v2/user/me",
        success: async function (res: any) {
          const http = inst?.appContext.config.globalProperties.$http;
          console.log("User Info From Kakao: ", res);
          const customRes = await http.get(`/auth/customToken/${res.id}`); // kakao id
          signInWithCustomToken(auth, customRes.data.token)
            .then(async (uc) => {
              // kakao.API.request({
              //   url: "/v1/api/talk/channels",
              //   success: function (res: any) {
              //     console.log("카카오 채널목록: ", res);
              //     console.log("ADD CHANNEL");
              //   },
              //   fail: function (error: any) {
              //     console.error("카카오 채널목록 에러: ", error);
              //   },
              // });
              // kakao.Channel.addChannel({ channelPublicId: kakaoChannelId });
              // console.log("Chat CHANNEL");
              // kakao.Channel.chat({
              //   channelPublicId: kakaoChannelId,
              // });

              const user = await getUserById(uc.user.uid);
              console.log(
                "User from getUserById: ",
                user,
                "Uid: ",
                uc.user.uid
              );
              if (user) {
                if (user.userInfo.passed) {
                  authS.login(user);
                  router.goHome(user);
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
      @click="onKakaoLogin"
      src="/img/kakao_login_medium_wide.png"
      style="cursor: pointer"
    />
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
