<template>
  <n-space vertical justify="center" style="height: 90vh; width: 100%">
    <n-card style="width: 40%; margin: auto">
      <n-form
        id="loginForm"
        ref="formRef"
        inline
        :label-width="80"
        label-placement="top"
        :model="loginInfo"
        :rules="rules"
        size="medium"
      >
        <n-grid cols="1" :x-gap="24">
          <n-form-item-gi label="이메일" path="email">
            <n-input
              v-model:value="loginInfo.email"
              type="text"
              placeholder="이메일을 입력 해주세요"
            />
          </n-form-item-gi>
          <n-form-item-gi cols="1" label="패스워드" path="password">
            <n-input
              type="password"
              v-model:value="loginInfo.password"
              autocomplete="on"
              show-password-on="click"
              placeholder="아이콘을 눌러 비밀번호를 확인 할 수 있습니다."
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button style="margin-right: 1vw" @click="onLogin">로그인</n-button>
          <n-button @click="router.push({ name: 'SignUp' })">회원가입</n-button>
        </n-space>
      </template>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { emailRule, pwRule } from "@/composables/input/formRule";
import { type FormInst, useMessage } from "naive-ui";
import { ref } from "vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  type AuthError,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { ioSignIn } from "@/plugins/firebase/store";
import { useEventListener } from "@/composables/event";
import { useAuthStore } from "@/stores";
const router = useRouter();
const authS = useAuthStore();
const formRef = ref<FormInst | null>(null);
const auth = getAuth();
const message = useMessage();
const loginInfo = ref({
  email: "shop@shop.com",
  password: "",
});

useEventListener(
  () => document.querySelector("#loginForm"),
  "keyup",
  (evt: KeyboardEvent) => {
    if (evt.key === "Enter") {
      onLogin(evt);
    }
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onLogin(e: MouseEvent | KeyboardEvent) {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const v = loginInfo.value;
      signInWithEmailAndPassword(auth, v.email, v.password)
        .then(async (userCredential) => {
          const user = await ioSignIn(userCredential);
          authS.login(user);
          message.success(`${user.name}님 반갑습니다!`);
          router.goHome(user);
        })
        .catch((error: AuthError) => {
          if (error.code === "auth/wrong-password") {
            message.error("패스워드가 틀렸습니다.");
          } else if (error.code === "auth/user-not-found") {
            message.error("가입되지 않은 계정입니다.");
          } else {
            message.error(
              `error code: ${error.code} \n error message: ${error.message}`
            );
          }
        });
    } else {
      message.error("작성란을 올바르게 작성해주세요.");
    }
  });
}
const rules = {
  email: emailRule,
  password: pwRule,
};
</script>
