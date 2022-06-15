<script setup lang="ts">
import { useMessage } from "naive-ui";
import { getCurrentInstance } from "vue";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useRouter } from "vue-router";
import { useEventListener } from "@/composables/event";
import { useAuthStore } from "@/stores";
import { getUserById } from "@/plugins/firebase";
import { USER_PROVIDER } from "@/types";
const inst = getCurrentInstance();
const router = useRouter();
const auth = getAuth();
const msg = useMessage();
const authS = useAuthStore();

useEventListener(
  () => document.querySelector("#loginForm"),
  "keyup",
  (evt: KeyboardEvent) => {
    if (evt.key === "Enter") {
      onKakaoLogin();
    }
  }
);
function onKakaoLogin() {
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  console.log("kakao: ", kakao);
  kakao.Auth.login({
    success: (obj: any) => {
      console.log("Login Response:", obj);
      const accessToken: string = obj.access_token;
      const idToken: string = obj.id_token;
      const scope: string = obj.scope;
      kakao.API.request({
        url: "/v2/user/me",
        success: async function (res: any) {
          const http = inst?.appContext.config.globalProperties.$http;
          const kakaoId: number = res.id;
          const email: string = res.kakao_account.email;
          const profileImg: string = res.properties.profile_image;
          const customRes = await http.get(`/auth/customToken/${kakaoId}`);
          console.log("customToken Response: ", JSON.stringify(customRes));
          console.log("customToken Response data ", customRes.data);
          signInWithCustomToken(auth, customRes.data.token)
            .then(async (uc) => {
              const user = await getUserById(uc.user.uid);
              if (user) {
                authS.login(user);
                router.goHome(user);
              } else {
                router.push({
                  name: "SignUp",
                  params: {
                    userId: uc.user.uid,
                    userName: uc.user.displayName,
                    email: email,
                    profileImg,
                    providerId: USER_PROVIDER.KAKAO,
                  },
                });
              }
            })
            .catch((error) => {
              if (error.code) {
                throw new Error(
                  `===> Kakao signInWithCustomToken Error Code: ${error.code}, Msg: ${error.message}`
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

      console.log("accessToken:", accessToken);
      console.log("idToken:", idToken);
      console.log("scope:", scope);
    },
    fail: function (err: any) {
      alert(JSON.stringify(err));
    },
  });
}
</script>

<template>
  <n-space id="login-page" vertical>
    <n-image src="/logo.png" width="100" />
    <n-h2>In-Out Box</n-h2>
    <n-image
      preview-disabled
      @click="onKakaoLogin"
      src="/img/kakao_login_medium_wide.png"
    />
  </n-space>
</template>

<style scoped>
#login-page {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
}
</style>
