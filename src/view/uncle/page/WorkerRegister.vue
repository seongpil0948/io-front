<script setup lang="ts">
import {
  IoUser,
  IoUserInfo,
  USER_DB,
  USER_PROVIDER,
  USER_ROLE,
} from "@/composable";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { getCurrentInstance, ref } from "vue";

const msg = useMessage();
const inst = getCurrentInstance();
const name = ref("");
const userId = ref(null);
const displayName = ref(null);
const phone = ref(null);
const email = ref(null);
// FIXME: 저장안되는중 타겟건물들 관리자가 등록하면, 그 아이디들 저장하도록
const areaInCharges = ref([]);
const profileImg = ref(null);
const options = [
  {
    label: "건물1",
    value: "song0",
  },
  {
    label: "건물2",
    value: "song1",
  },
  {
    label: "건물3",
    value: "song2",
  },
  {
    label: "건물4",
    value: "song3",
  },
];
const kakaoAuthed = ref(false);
function fail(err: any) {
  msg.error(`카카오 로그인 에러${JSON.stringify(err)}`);
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

          kakaoAuthed.value = true;
        },
        fail,
      });
    },
    fail,
  });
}
async function onSignUp() {
  if (!kakaoAuthed.value) {
    msg.error("카카오 인증이 필요합니다.");
  } else if (!displayName.value) {
    msg.error("이름을 입력해주세요.");
  } else if (!email.value) {
    msg.error("이메일을 입력해주세요.");
  } else {
    const providerId = USER_PROVIDER.KAKAO;
    const user = new IoUser({
      userInfo: {
        userId: userId.value!,
        providerId,
        emailVerified: false,
        role: USER_ROLE.UNCLE_WORKER,
        displayName: displayName.value ?? undefined,
        userName: name.value,
        email: email.value,
        phone: phone.value ?? undefined,
        profileImg: profileImg.value ?? undefined,
        fcmTokens: [],
        passed: true,
      },
    });
    console.log("Signed User: ", user);
    await user.update();
    msg.success("가입 완료! 사장님 믿고 있었다구!", makeMsgOpt());
    kakaoAuthed.value = false;
  }
}
const width = "35vw";
</script>
<template>
  <n-h1>근로자 신규 등록</n-h1>
  <n-space vertical align="start">
    <n-space :style="`width: ${width}`">
      <n-button @click="onKakaoAuth" type="primary"> Kakao 인증 </n-button>
      <n-checkbox :checked="kakaoAuthed" />
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
    <n-select
      :style="`width: ${width}`"
      placeholder="담당건물"
      v-model:value="areaInCharges"
      multiple
      :options="options"
    />

    <n-button :style="`width: ${width}`" @click="onSignUp"> 가입하기 </n-button>
  </n-space>
</template>
