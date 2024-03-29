<script setup lang="ts">
import { IoAccount, setWorkerId, IoUser, USER_DB } from "@/composable";
import { ioFire } from "@/plugin/firebase";
import { useAuthStore } from "@/store";
import { makeMsgOpt, password, email as validEmail } from "@/util";
import { createUserWithEmailAndPassword, getAuth } from "@firebase/auth";
import { WorkerInfo, USER_PROVIDER } from "@io-boxies/js-lib";
import { useLogin } from "@io-boxies/vue-lib";
import {
  NButton,
  NCheckbox,
  NGradientText,
  NInput,
  NSpace,
  useMessage,
} from "naive-ui";
import { getCurrentInstance, ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { ioFireStore } from "@/plugin/firebase";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const msg = useMessage();
const inst = getCurrentInstance();
const log = useLogger();
const router = useRouter();
const name = ref("");
const userId = ref<string | null>(null);
const displayName = ref<string | null>(null);
const phone = ref(null);
const email = ref<string | null>(null);
const pw = ref<string | null>(null);
const profileImg = ref(null);
const account = ref<IoAccount | null>(null);
const workerInfo = ref<WorkerInfo | null>(null);

function onSubmitAccount(acc: IoAccount) {
  account.value = acc;
  msg.info("계좌정보 저장 완료!");
}
function onSubmitWorker(acc: WorkerInfo) {
  workerInfo.value = acc;
}
const authed = ref(false);
function fail(err: any) {
  msg.error(`소셜 로그인 에러${JSON.stringify(err)}`);
}
function onKakaoAuth() {
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  kakao.Auth.loginForm({
    success: (obj: any) => {
      console.info("kakao login success: ", obj);
      kakao.API.request({
        url: "/v2/user/me",
        success: async function (res: any) {
          const uid = res.id.toString();
          const user = await USER_DB.getUserById(ioFireStore, uid);
          if (user) return msg.error("이미 존재하는 유저입니다.");
          email.value = res.kakao_account.email;
          profileImg.value = res.properties.profile_image;
          userId.value = uid;
          name.value = res.properties.nickname;

          authed.value = true;
          providerId = "KAKAO";
        },
        fail,
      });
    },
    fail,
  });
}
const { googleLogin } = useLogin(
  import.meta.env.MODE === "production" ? "io-prod" : "io-dev",
  "/auth/customToken"
);
async function onGoogleAuth() {
  const u = (await googleLogin(ioFireStore, false)) as any;
  console.log("Google Login  Res: ", u);

  const uid = u.uid;
  const user = await USER_DB.getUserById(ioFireStore, uid);
  if (user) return msg.error("이미 존재하는 유저입니다.");
  email.value = u.email ?? "";
  profileImg.value = u.photoURL ?? "";
  userId.value = uid;
  name.value = u.displayName ?? "";
  providerId = "GOOGLE";
  authed.value = true;
}
async function onEmailAuth() {
  if (!email.value || !validEmail(email.value))
    return msg.error("유효하지 않은 이메일");
  if (!pw.value || !password(pw.value))
    return msg.error(`유효하지 않은 비밀번호`);
  try {
    const credential = await createUserWithEmailAndPassword(
      getAuth(ioFire.app),
      email.value,
      pw.value
    );
    userId.value = credential.user.uid;
    authed.value = true;
    providerId = "EMAIL";
    log.info(null, "createUserWithEmailAndPassword: ", credential);
  } catch (e: any) {
    if (typeof e.code === "string") {
      if (e.code.includes("email-already-in-use")) {
        msg.error(`${email.value}는 사용중인 이메일 입니다.`);
      } else {
        throw e;
      }
    }
    authed.value = false;
  }
}
let providerId: USER_PROVIDER | null = null;
async function onSignUp() {
  if (!authed.value || !providerId) {
    return msg.error("소셜 인증이 필요합니다.");
  } else if (!displayName.value) {
    return msg.error("이름을 입력해주세요.");
  } else if (!email.value) {
    return msg.error("이메일을 입력해주세요.");
  } else if (!account.value) {
    return msg.error("계좌 정보를 입력 및 제출해주세요.");
  } else if (!workerInfo.value) {
    return msg.error("근로자 정보를 입력 및 제출해주세요.");
  } else {
    const user: IoUser = {
      userInfo: {
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId.value!,
        providerId,
        emailVerified: false,
        role: "UNCLE_WORKER",
        displayName: displayName.value ?? undefined,
        userName: name.value,
        email: email.value,
        phone: phone.value ?? undefined,
        profileImg: profileImg.value ?? undefined,
        fcmTokens: [],
        passed: false,
        managerId: auth.currUser().userInfo.userId,
        account: account.value,
      },
    };
    console.log("Signed User: ", user);
    await USER_DB.updateUser(ioFireStore, user);
    await setWorkerId(auth.currUser(), userId.value!);
    msg.success("가입 완료! 사장님 믿고 있었다구!", makeMsgOpt());
    authed.value = false;
    router.push({ name: "WorkerHistory" });
  }
}
const width = "35vw";
</script>
<template>
  <n-card hoverable segmented title="근로자 신규 등록">
    <n-space vertical align="start" item-style="width: 90%">
      <n-space :style="`width: ${width}`">
        <n-button :disabled="authed" type="primary" @click="onKakaoAuth">
          Kakao 인증
        </n-button>
        <n-button :disabled="authed" type="primary" @click="onGoogleAuth">
          Google 인증
        </n-button>
        <n-button :disabled="authed" type="primary" @click="onEmailAuth">
          이메일 인증
        </n-button>
        <n-checkbox :checked="authed" />
      </n-space>
      <n-input
        v-model:value="email"
        :style="`width: ${width}`"
        placeholder="이메일 입력"
      />
      <n-input
        v-model:value="pw"
        :style="`width: ${width}`"
        placeholder="비밀번호 입력"
      />
      <n-input
        v-model:value="displayName"
        :style="`width: ${width}`"
        placeholder="실명입력"
      >
        <template #prefix>
          <n-gradient-text type="info"> 이름 </n-gradient-text>
        </template>
      </n-input>
      <n-input
        v-model:value="phone"
        :style="`width: ${width}`"
        placeholder="휴대전화번호"
      >
        <template #prefix>
          <n-gradient-text type="info"> 연락처 </n-gradient-text>
        </template>
      </n-input>
      <bank-account-form :use-submit="true" @submit:account="onSubmitAccount" />
      <n-checkbox :checked="account !== null"> 계좌 제출여부 </n-checkbox>
      <worker-info-form @submit:worker-info="onSubmitWorker" />
      <n-checkbox :checked="workerInfo !== null">
        근로자정보 제출여부
      </n-checkbox>
      <n-button :style="`width: ${width}`" @click="onSignUp">
        가입하기
      </n-button>
    </n-space>
  </n-card>
</template>
