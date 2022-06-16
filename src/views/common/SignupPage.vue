<script setup lang="ts">
import {
  IoUser,
  USER_ROLE,
  emailRule,
  pwRule,
  notNullRule,
} from "@/composables";
import { type FormInst, type FormItemRule, useMessage } from "naive-ui";
import { onMounted, ref } from "vue";
import { getAuth } from "firebase/auth";
import { useRouter } from "vue-router";
import { LocateCRT } from "@/types";

const router = useRouter();
const params = router.currentRoute.value.params;
// if (!params.userId) {
//   console.error("User ID not Received In SignUp Page(Landing)", params);
//   router.replace({ name: "Login" });
// }
const formRef = ref<FormInst | null>(null);
const auth = getAuth();
const message = useMessage();
const loginInfo = ref({
  name: params.userName as string,
  displayName: "",
  email: params.email as string,
  password: "",
  reenteredPassword: "",
  role: USER_ROLE.SHOP,
  locations: [] as LocateCRT[],
});

let step = ref(1);
onMounted(() => {
  setTimeout(() => {
    step.value = 2;
  }, 1000);
});

async function onSignUp(e: MouseEvent) {
  e.preventDefault();
  const fcmTokens = auth.currentUser
    ? [await auth.currentUser?.getIdTokenResult()]
    : [];
  console.log("====> FcmTokens", fcmTokens);
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const v = loginInfo.value;
      const user = new IoUser({
        userId: params.userId as string,
        displayName: v.displayName,
        providerId: params.providerId as string,
        userName: v.name,
        email: v.email,
        emailVerified: false,
        profileImg: params.profileImg as string,
        locations: v.locations,
        role: v.role,
        fcmTokens,
      });
      await user.update();
      message.success("SignUp is Success");
      router.replace({ name: "Login" });
    } else {
      message.error("작성란을 올바르게 작성해주세요.");
    }
  });
}
const rules = {
  name: notNullRule,
  email: emailRule,
  password: pwRule,
  reenteredPassword: [
    {
      required: true,
      validator: (rule: FormItemRule, value: string): boolean =>
        value === loginInfo.value.password,
      message: "패스워드와 같지 않습니다.",
      trigger: ["blur", "password-input"],
    },
  ],
};
</script>
<template>
  <n-space id="signup-page-container" vertical>
    <n-image preview-disabled src="/logo.png" width="30" />
    <n-h5 class="txt" style="color: dimgray">
      <div v-if="step === 1">백날 로고를 눌러도 흔들리는 기능 뿐이에요</div>
      <div v-if="step === 2">히힛 간지러워요! 으익</div>
      <div v-if="step > 2">우리 천천히 하나씩 다 해나아가요 :)</div>
    </n-h5>
    <n-card style="width: 95vw; height: 80vh">
      <n-space
        vertical
        style="align-items: center; height: 100%"
        justify="center"
      >
        <n-image
          v-if="step < 3"
          preview-disabled
          class="vibe"
          src="/logo.png"
          width="100"
        />

        <n-h2
          v-if="step === 1 || step === 2"
          class="txt"
          style="min-height: 10vh"
        >
          <Transition name="one">
            <div v-if="step === 1">인-아웃 박스에 오신것을 환영 합니다!</div>
          </Transition>
          <Transition name="two">
            <div v-if="step === 2">
              쇼핑몰 주문부터 삼춘픽업 - 상품 정보 정산까지 한번에
              해결해드립니다!
            </div>
          </Transition>
        </n-h2>
        <Transition name="two">
          <n-button text v-if="step === 2" @click="step = 3"
            ><n-h3
              class="txt"
              style="min-height: 5vh; text-decoration: underline"
            >
              지금 회원가입하기</n-h3
            ></n-button
          >
        </Transition>
        <n-form
          v-if="step === 3"
          ref="formRef"
          style="width: 60%"
          inline
          :label-width="80"
          label-placement="top"
          :model="loginInfo"
          :rules="rules"
          size="medium"
        >
          <n-grid cols="1" :x-gap="24">
            <n-form-item-gi label="이름" path="name">
              <n-input
                v-model:value="loginInfo.name"
                type="text"
                placeholder="이름을 입력 해주세요"
              />
            </n-form-item-gi>
            <n-form-item-gi label="이메일" path="email">
              <n-input
                v-model:value="loginInfo.email"
                type="text"
                placeholder="이메일을 입력 해주세요"
              />
            </n-form-item-gi>
            <n-form-item-gi label="패스워드" path="password">
              <n-input
                type="password"
                v-model:value="loginInfo.password"
                show-password-on="click"
                placeholder="아이콘을 눌러 비밀번호를 확인 할 수 있습니다."
              />
            </n-form-item-gi>
            <n-form-item-gi label="패스워드 재입력" path="reenteredPassword">
              <n-input
                v-model:value="loginInfo.reenteredPassword"
                :disabled="!loginInfo.password"
                type="password"
                @keydown.enter.prevent
              />
            </n-form-item-gi>
            <n-form-item-gi label="역할" path="role">
              <n-radio-group v-model:value="loginInfo.role" name="Role">
                <n-space>
                  <n-radio :value="USER_ROLE.SHOP"> SHOP </n-radio>
                  <n-radio :value="USER_ROLE.VENDOR"> VENDOR </n-radio>
                  <n-radio :value="USER_ROLE.UNCLE"> UNCLE </n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <template #action>
          <n-space justify="end">
            <n-button style="margin-right: 1vw" @click="onSignUp">
              회원가입
            </n-button>
          </n-space>
        </template>
        <n-steps
          v-if="step > 2"
          :current="(step - 1 as number)"
          style="margin-top: 1vh; margin-left: 7%"
        >
          <template #finish-icon>
            <n-image
              preview-disabled
              class="vibe"
              src="/logo.png"
              width="20"
              height="20"
            />
          </template>
          <n-step title="매장 정보 입력" />
          <n-step title="사업자 정보 입력" />
          <n-step title="운영방식 설정" />
          <n-step title="가입완료" />
        </n-steps>
      </n-space>
    </n-card>
  </n-space>
</template>

<style>
#signup-page-container {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
}
.one-enter-active,
.one-leave-active {
  transition: opacity 1s ease;
}
.one-enter-from,
.one-leave-to {
  opacity: 0;
}

.two-enter-active {
  transition: opacity 1s ease 2s;
}
.two-enter-from {
  opacity: 0;
}
.txt {
  color: dimgray;
}

.vibe:hover {
  animation-duration: 0.05s;
  animation-name: vibration;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes vibration {
  from {
    margin-left: 5%;
  }

  to {
    margin-left: -5%;
  }
}
</style>
