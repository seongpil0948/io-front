<script setup lang="ts">
import { IoAccount, setWorkerId, useLogin } from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { WorkerInfo, USER_DB, USER_PROVIDER, IoUser } from "@io-boxies/js-lib";
import {
  NButton,
  NCheckbox,
  NGradientText,
  NH1,
  NInput,
  NSpace,
  useMessage,
} from "naive-ui";
import { getCurrentInstance, ref } from "vue";

const auth = useAuthStore();
const msg = useMessage();
const inst = getCurrentInstance();
const name = ref("");
const userId = ref(null);
const displayName = ref(null);
const phone = ref(null);
const email = ref(null);
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
      console.log("loginForm: ", obj);
      kakao.API.request({
        url: "/v2/user/me",
        success: async function (res: any) {
          console.log("Kakao User Res: ", res);
          const uid = res.id.toString();
          const user = await USER_DB.getUserById(uid);
          if (user) return msg.error("이미 존재하는 유저입니다.");
          email.value = res.kakao_account.email;
          profileImg.value = res.properties.profile_image;
          userId.value = uid;
          name.value = res.properties.nickname;

          authed.value = true;
        },
        fail,
      });
    },
    fail,
  });
}
const { googleLogin } = useLogin();
async function onGoogleAuth() {
  const u = (await googleLogin(false)) as any;
  console.log("Google Login  Res: ", u);

  const uid = u.uid;
  const user = await USER_DB.getUserById(uid);
  if (user) return msg.error("이미 존재하는 유저입니다.");
  email.value = u.email ?? "";
  profileImg.value = u.photoURL ?? "";
  userId.value = uid;
  name.value = u.displayName ?? "";

  authed.value = true;
}
async function onSignUp() {
  if (!authed.value) {
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
    const providerId = USER_PROVIDER.KAKAO;
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
        managerId: auth.currUser.userInfo.userId,
        account: account.value,
      },
    };
    console.log("Signed User: ", user);
    await USER_DB.updateUser(user);
    await setWorkerId(auth.currUser, userId.value!);
    msg.success("가입 완료! 사장님 믿고 있었다구!", makeMsgOpt());
    authed.value = false;
  }
}
const width = "35vw";
</script>
<template>
  <n-h1>근로자 신규 등록</n-h1>
  <n-space vertical align="start">
    <n-space :style="`width: ${width}`">
      <n-button @click="onKakaoAuth" type="primary"> Kakao 인증 </n-button>
      <n-button @click="onGoogleAuth" type="primary"> Google 인증 </n-button>
      <n-checkbox :checked="authed" />
    </n-space>
    <n-input
      :style="`width: ${width}`"
      v-model:value="displayName"
      placeholder="실명입력"
    >
      <template #prefix>
        <n-gradient-text type="info"> 이름 </n-gradient-text>
      </template>
    </n-input>
    <n-input
      :style="`width: ${width}`"
      v-model:value="phone"
      placeholder="휴대전화번호"
    >
      <template #prefix>
        <n-gradient-text type="info"> 연락처 </n-gradient-text>
      </template>
    </n-input>
    <bank-account-form @submit:account="onSubmitAccount" />
    <n-checkbox :checked="account !== null">계좌 제출여부 </n-checkbox>
    <worker-info-form @submit:workerInfo="onSubmitWorker" />
    <n-checkbox :checked="workerInfo !== null">근로자정보 제출여부 </n-checkbox>
    <n-button :style="`width: ${width}`" @click="onSignUp"> 가입하기 </n-button>
  </n-space>
</template>
