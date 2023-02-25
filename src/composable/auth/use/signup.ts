import { useDialog, useMessage } from "naive-ui";
import { ref, watch, defineAsyncComponent } from "vue";
import {
  createUserWithEmailAndPassword,
  UserCredential,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  signInWithEmailAndPassword,
} from "@firebase/auth";
import { IO_ENV } from "@io-boxies/js-lib";
import {
  getGoogleAuthProvider,
  useLogin,
} from "@/component/common/login/login";
import { useAlarm, useKakao } from "@io-boxies/vue-lib";
import { ioFire, ioFireStore } from "@/plugin/firebase";
import { axiosConfig } from "@/plugin/axios";
import {
  isMobile,
  makeMsgOpt,
  useFireWork,
  email as emailValidator,
} from "@/util";
import { useRouter } from "vue-router";
import { useLogger } from "vue-logger-plugin";
import {
  catchError,
  mapUserProvider,
  useEmailPwForm,
  getUserName,
  IoUser,
  IoUserInfo,
  userFromCredential,
  USER_DB,
  USER_PROVIDER,
  USER_ROLE,
} from "@/composable";
import { getAnalytics, logEvent } from "@firebase/analytics";

export function useSignup(u?: IoUser, initialStep?: SignupStep) {
  const userRole = ref<USER_ROLE | null>(null);
  const step = ref<SignupStep>(initialStep ?? "selectRole");
  const router = useRouter();
  const dialog = useDialog();
  const msg = useMessage();
  const log = useLogger();
  // const signupEmail = () => (showInputEmail.value = true);
  const auth = getAuth(ioFire.app);
  auth.useDeviceLanguage();
  const { getKakao } = useKakao();
  const { getCustomKakaoToken } = useLogin(
    import.meta.env.MODE === "production" ? "io-prod" : ("io-dev" as IO_ENV),
    `${axiosConfig.baseURL}/auth/customToken`
  );
  const user = ref<IoUser | null>(u ?? null);
  watch(
    () => step.value,
    (val) => {
      if (
        !["selectRole", "selectMethod", "showInputEmail"].includes(val) &&
        !user.value &&
        !userRole.value
      )
        toStepOne();
    }
  );
  async function afterSignup(d: {
    credential: UserCredential;
    uInfo?: Partial<IoUserInfo>;
  }) {
    const exist = await USER_DB.getUserById(ioFireStore, d.credential.user.uid);
    if (!userRole.value) return msg.error(`역할을 선택 해주세요`);
    else if (exist)
      return msg.error(
        `이미 존재하거나 삭제된 유저 입니다. ${getUserName(exist)}`
      );
    const u = await userFromCredential(
      d.credential,
      d.credential.user.displayName ?? "유저이름",
      userRole.value,
      mapUserProvider(d.credential.providerId ?? "EMAIL")
    );
    if (d.uInfo) {
      Object.assign(u.userInfo, d.uInfo);
    }
    await USER_DB.updateUser(ioFireStore, u);
    logEvent(getAnalytics(ioFire.app), "sign_up", {
      method: u.userInfo.providerId,
      userRole: u.userInfo.role,
    });
    user.value = u;
    step.value = "userInfo";
  }

  const { emailFormRef, emailModel, rules } = useEmailPwForm();
  async function submitEmail() {
    const e = emailModel.value;

    emailFormRef.value?.validate(async (errors) => {
      if (errors || !e.email || !e.password)
        return msg.error("올바르게 작성 해주세요", makeMsgOpt());
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          e.email,
          e.password
        );
        afterSignup({ credential });
      } catch (err1: any) {
        if (err1 && typeof err1.code === "string") {
          if (err1.code.includes("email-already-in-use")) {
            return signInWithEmailAndPassword(auth, e.email, e.password)
              .then((credential) => {
                return afterSignup({ credential });
              })
              .catch((err2) => {
                msg.error("이미 존재하는 이메일 입니다.", makeMsgOpt());
                throw err2;
              });
          }
        }
        throw err1;
      }
    });
  }
  async function signupGoogle() {
    try {
      return signInWithPopup(auth, getGoogleAuthProvider()).then(
        async (credential) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const oAuth = GoogleAuthProvider.credentialFromResult(credential);
          console.info("In google login", credential, oAuth);
          afterSignup({ credential });
        }
      );
    } catch (e: any) {
      log.error(null, "error in google signup", JSON.stringify(e));
    }
  }
  async function signupKakao() {
    const kakao: any = await getKakao();
    try {
      return new Promise((resolve, reject) => {
        getCustomKakaoToken("loginForm", kakao).then((data: any) => {
          signInWithCustomToken(auth, data.token)
            .then(async (uc) => {
              uc.providerId = USER_PROVIDER.KAKAO;
              const r = data.meRes;
              const email = r.kakao_account.email;
              if (typeof email !== "string" || !emailValidator(email)) {
                return reject(
                  "회원가입 도중 카카오로부터 이메일을 받아오지 못하였습니다."
                );
              }
              afterSignup({
                credential: uc,
                uInfo: {
                  email,
                  profileImg: r.properties && r.properties.profile_image,
                  userName: r.properties && r.properties.nickname,
                  displayName: r.properties && r.properties.nickname,
                },
              });
              resolve(null);
            })
            .catch((error) => reject(error));
        });
      });
    } catch (e: any) {
      log.error(null, "error in kakao signup", JSON.stringify(e));
    }
  }

  function toStepOne() {
    step.value = "selectRole";
    dialog.destroyAll();
    userRole.value = null;
  }

  function selectRole(role: USER_ROLE) {
    const isValid = ["SHOP", "VENDOR", "UNCLE"].includes(role);
    const content =
      role === "SHOP"
        ? "쇼핑몰을 운영하는 사장님을 위한 서비스."
        : role === "VENDOR"
        ? "도매업을 운영하는 사장님을 위한 서비스."
        : role === "UNCLE"
        ? "도매시장에서 픽업 및 물류대행을 운영하는 사장님을 위한 서비스."
        : "지원하지 않는 ROLE입니다.";
    dialog.success({
      content,
      positiveText: "선택완료",
      onPositiveClick: () => {
        if (isValid) {
          userRole.value = role;
          step.value = "selectMethod";
        }
      },
      showIcon: false,
      closable: false,
      style: {
        width: isMobile() ? "70%" : "45%",
      },
    });
  }
  const acceptTerms = ref(false);
  const { play, stop } = useFireWork();
  const smtp = useAlarm();
  async function onSignUp() {
    const u = user.value;

    if (!acceptTerms.value) {
      return msg.error("이용약관에 동의 해주세요", makeMsgOpt());
    } else if (!u) {
      log.error(null, "Signup step done, but user value is null");
      return msg.error("(오류) 유저정보가 없습니다.", makeMsgOpt());
    }
    try {
      msg.success("가입 완료! 사장님 믿고 있었다구!", makeMsgOpt());
      await smtp.sendAlarm({
        toUserIds: [u.userInfo.userId],
        subject: `inoutbox 회원가입 처리내역 알림.`,
        body: `${getUserName(
          u
        )} 께서 제출하신 정보를 바탕으로 계정 검토 및 승인 후 홈페이지 및 어플 이용이 가능합니다.`,
        notiLoadUri: "/",
        uriArgs: {},
        sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
        pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
      });
    } catch (err) {
      catchError({ err, msg, uid: u.userInfo.userId });
    }
    play();
    step.value = "doneSignup";
  }
  return {
    selectRole,
    signupGoogle,
    signupKakao,
    submitEmail,
    router,
    emailFormRef,
    emailModel,
    rules,
    toStepOne,
    step,
    user,
    acceptTerms,
    onSignUp,
    stop,
  };
}

export const AsyncUserInfoForm = defineAsyncComponent(
  () => import("@/component/form/UserInfoForm.vue")
);
export const AsyncCompanyInfoForm = defineAsyncComponent(
  () => import("@/component/form/CompanyInfoForm.vue")
);
export const AsyncShopOperInfoVue = defineAsyncComponent(
  () => import("@/component/form/ShopOperInfo.vue")
);
export const AsyncVendorOperInfoVue = defineAsyncComponent(
  () => import("@/component/form/VendorOperInfo.vue")
);

export interface UserInfoInst {
  getUserInfo: () => Promise<{
    userInfo?: IoUserInfo;
  }>;
}

export type SignupStep =
  | "selectRole"
  | "selectMethod"
  | "showInputEmail"
  | "userInfo"
  | "companyInfo"
  | "shopOperInfo"
  | "vendorOperInfo"
  | "term"
  | "doneSignup";
