import {
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  UserCredential,
} from "@firebase/auth";
import { intervalToDuration } from "date-fns";
import { logEvent, getAnalytics } from "@firebase/analytics";
import { type Firestore } from "@firebase/firestore";
import {
  FcmToken,
  getFcmToken,
  IoFireApp,
  IoUser,
  KAKAO_CHANNEL_ID,
  loadDate,
  USER_DB,
  USER_PROVIDER,
  type IO_ENV,
} from "@io-boxies/js-lib";
import { onBeforeMount } from "vue";
import axios from "axios";
import { useKakao } from "@io-boxies/vue-lib";
import { useLogger } from "vue-logger-plugin";

export function useLogin(env: IO_ENV, customTokenUrl: string) {
  const ioFire = IoFireApp.getInst(env);
  onBeforeMount(() => IoFireApp.getInst(env));
  const auth = getAuth(ioFire.app);
  const { getKakao } = useKakao();
  auth.useDeviceLanguage();

  const log = useLogger();

  async function login(
    store: Firestore,
    credential: UserCredential
  ): Promise<LoginReturn> {
    console.log("in login", store, credential);
    const user = await USER_DB.getUserById(store, credential.user.uid);
    console.log("getUserById:", user);
    const data: LoginReturn = {
      user: user ?? undefined,
      credential,
    };
    if (!user) {
      data.userNotFound = true;
    }

    if (user) {
      await updateUserFcm(user);
      if (user.userInfo.passed) {
        logEvent(getAnalytics(ioFire.app), "login", {
          method: credential.providerId ?? "None",
        });
        return data;
      } else {
        data.noConfirm = true;
        return data;
      }
    }
    return data;
  }

  async function emailLogin(
    store: Firestore,
    email: string,
    password: string
  ): Promise<LoginReturn | undefined> {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return login(store, credential);
    } catch (err: any) {
      log.error(null, "error in email login", JSON.stringify(err));
      if (err && typeof err.code === "string") {
        if (err.code.includes("user-not-found")) {
          return {
            userNotFound: true,
            err: err,
          };
        } else if (err.code.includes("auth/wrong-password")) {
          return {
            wrongPassword: true,
            err: err,
          };
        }
      }
      throw err;
    }
  }

  async function googleLogin(
    store: Firestore,
    loginAfter = true
  ): Promise<LoginReturn | undefined> {
    try {
      return signInWithPopup(auth, getGoogleAuthProvider()).then(
        async (credential) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const oAuth = GoogleAuthProvider.credentialFromResult(credential);
          console.log("google oAuth: ", oAuth);

          if (loginAfter) {
            return login(store, credential);
          }
        }
      );
    } catch (e: any) {
      log.error(null, "error in google login", JSON.stringify(e));
    }
  }

  async function getCustomKakaoToken(auto: "loginForm" | "login", kakao: any) {
    return new Promise((resolve, reject) => {
      kakao.Auth[auto]({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        success: (obj: any) => {
          kakao.API.request({
            url: "/v2/user/me",
            success: async function (res: any) {
              const customRes = await axios
                // .get(`/auth/customToken/${res.id}`); // kakao id;
                .get(`${customTokenUrl}/${res.id}`); // kakao id;
              resolve({ token: customRes.data.token, meRes: res });
            },
            fail: (error: any) => reject(error),
          });
        },
        fail: function (err: any) {
          reject(err);
        },
      });
    });
  }
  async function onKakaoLogin(
    store: Firestore,
    auto: "loginForm" | "login"
  ): Promise<LoginReturn | undefined> {
    const kakao: any = await getKakao();
    return new Promise((resolve, reject) => {
      getCustomKakaoToken(auto, kakao).then((res: any) => {
        signInWithCustomToken(auth, res.token)
          .then(async (uc) => {
            uc.providerId = USER_PROVIDER.KAKAO;
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
            });

            resolve(login(store, uc));
          })
          .catch((error) => reject(error));
      });
    });
  }
  return {
    emailLogin,
    googleLogin,
    onKakaoLogin,
    login,
    getCustomKakaoToken,
  };
}

export interface LoginReturn {
  user?: IoUser;
  noConfirm?: boolean;
  wrongPassword?: boolean;
  userNotFound?: boolean;
  credential?: UserCredential;
  err?: any;
}
export interface EmailModelType {
  email: string | null;
  password: string | null;
}
async function updateUserFcm(user: IoUser) {
  const token = await getFcmToken();
  const tokens = user.userInfo.fcmTokens ?? [];
  const newTokens: FcmToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const intervalParam = {
      start: new Date(),
      end: t.createdAt instanceof Date ? t.createdAt : loadDate(t.createdAt),
    };

    const interval = intervalToDuration(intervalParam);
    if (interval.days && interval.days > 7) {
      newTokens.push(t);
    }
  }
  if (token !== null && tokens.every((t) => token.token !== t.token)) {
    newTokens.push(token);
  }
  user.userInfo.fcmTokens = newTokens;
}

export function getGoogleAuthProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/user.emails.read");
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
  return provider;
}
