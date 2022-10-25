import { useEventListener } from "@/util";
import { KAKAO_CHANNEL_ID } from "@/constants";
import { getCurrentInstance } from "vue";
import {
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { useLogger } from "vue-logger-plugin";
import { FcmToken, IoUser, USER_DB, USER_PROVIDER } from "@/composable";
import { logger } from "@/plugin/logger";
import { intervalToDuration } from "date-fns";

interface SignupParam {
  providerId: USER_PROVIDER;
  userId?: string;
  userName?: string;
  email?: string;
  profileImg?: string;
}

export function useLogin() {
  const log = useLogger();
  const inst = getCurrentInstance();
  const router = useRouter();
  const auth = getAuth();
  //   auth.languageCode = "ko";
  auth.useDeviceLanguage();
  const authS = useAuthStore();
  const msg = useMessage();
  const provider = new GoogleAuthProvider();
  //   provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
  provider.addScope("https://www.googleapis.com/auth/user.emails.read");
  //   provider.addScope("https://www.googleapis.com/auth/user.phonenumbers.read");
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

  async function login(uid: string, params: SignupParam, toSignUp = true) {
    const user = await USER_DB.getUserById(uid);
    log.debug("USER_DB.getUserById: ", user, "Uid: ", uid);
    if (user) {
      const token = await IoUser.getFcmToken();
      const tokens = user.userInfo.fcmTokens ?? [];
      const newTokens: FcmToken[] = [];
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const intervalParam = {
          start: new Date(),
          end:
            t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt),
        };

        const interval = intervalToDuration(intervalParam);
        console.log(" token interval:", interval, "param: ", intervalParam);

        if (interval.days && interval.days > 7) {
          console.log("in login pushed token");
          newTokens.push(t);
        }
      }
      if (token !== null && tokens.every((t) => token.token !== t.token)) {
        newTokens.push(token);
      }
      user.userInfo.fcmTokens = newTokens;
      await user.update();
      if (user.userInfo.passed) {
        await authS.login(user);
        router.goHome(user);
      } else {
        msg.error("관리자가 검토중인 계정입니다.");
        authS.logout();
      }
    } else {
      if (toSignUp)
        router.push({
          name: "SignUp",
          state: params as { [k: string]: any },
        });
    }
  }

  async function googleLogin(loginAfter = true) {
    return signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        console.log("credential: ", credential, "user: ", user);

        if (loginAfter) {
          login(user.uid, {
            providerId: "GOOGLE",
            userId: user.uid,
            userName: user.displayName ?? "",
            email: user.email ?? "",
            profileImg: user.photoURL ?? "",
          });
        }
        return user;
      })
      .catch((error) => {
        logger.error(
          null,
          error instanceof Error ? error.message : JSON.stringify(error),
          error.customData.email,
          error.code,
          error.message,
          GoogleAuthProvider.credentialFromError(error)
        );
      });
  }

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
                login(uc.user.uid, {
                  userId: uc.user.uid,
                  userName: uc.user.displayName ?? undefined,
                  email: res.kakao_account.email,
                  profileImg:
                    res.properties && res.properties.profile_image
                      ? res.properties.profile_image
                      : "/img/io-coin.png",
                  providerId: USER_PROVIDER.KAKAO,
                });
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
  return {
    login,
    onKakaoLogin,
    googleLogin,
  };
}
