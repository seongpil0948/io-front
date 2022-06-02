<template>
  <n-space vertical justify="center" style="height: 90vh; width: 100%">
    <n-card style="width: 40%; margin: auto">
      <n-form
        ref="formRef"
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
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { emailRule, pwRule, notNullRule } from "@/composables/input/formRule";
import { type FormInst, type FormItemRule, useMessage } from "naive-ui";
import { ref } from "vue";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";
import { USER_ROLE } from "@/composables/model";
import { ioSignUp } from "@/plugins/firebase/store";

const router = useRouter();
const formRef = ref<FormInst | null>(null);
const auth = getAuth();
const message = useMessage();
const loginInfo = ref({
  name: "",
  email: "",
  password: "",
  reenteredPassword: "",
  role: USER_ROLE.SHOP,
});

function onSignUp(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const v = loginInfo.value;
      createUserWithEmailAndPassword(auth, v.email, v.password)
        .then(async (userCredential) => {
          await ioSignUp(userCredential, v.name, v.role);
          message.success("SignUp is Success");
          router.replace({ name: "Login" });
        })
        .catch((error) => {
          const msg = `error code: ${error.code} \n error message: ${error.message}`;
          message.error(msg);
        });
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
