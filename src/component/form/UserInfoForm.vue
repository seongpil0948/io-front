<script setup lang="ts">
import {
  IoUser,
  IoUserInfo,
  LocateCRT,
  USER_PROVIDER,
  USER_ROLE,
  IoAccount,
} from "@/composable";
import { emailRule, nameLenRule } from "@/util";

import { getAuth } from "@firebase/auth";
import { FormInst } from "naive-ui";
import { reactive, ref } from "vue";

const auth = getAuth();
const props = defineProps<{
  userName: string;
  profileImg: string;
  email: string;
  userId: string;
  providerId: USER_PROVIDER;
  role: USER_ROLE;
}>();
defineExpose({ getUserInfo });
const formRef = ref<FormInst | null>(null);
const formModel = reactive({
  userName: props.userName ?? "",
  displayName: "",
  email: props.email ?? "",
  locations: [] as LocateCRT[],
});
const accInfo = ref<IoAccount | null>(null);
function onSubmitAccount(acc: IoAccount) {
  accInfo.value = acc;
}
async function getUserInfo(): Promise<{
  userInfo?: IoUserInfo;
}> {
  if (!accInfo.value) return { userInfo: undefined };
  const token = await IoUser.getFcmToken();
  const obj: IoUserInfo = Object.assign(
    { account: accInfo.value! },
    {
      userId: props.userId,
      providerId: props.providerId,
      emailVerified: false,
      profileImg: props.profileImg,
      passed: false,
      fcmTokens: auth.currentUser ? [token!] : ([] as string[]),
      role: props.role,
    },
    formModel
  );
  return { userInfo: obj };
}

const rule = {
  userName: nameLenRule,
  displayName: nameLenRule,
  email: emailRule,
};
</script>

<template>
  <n-form
    ref="formRef"
    inline
    style="max-height: 50vh"
    :label-width="80"
    label-placement="top"
    :model="formModel"
    :rules="rule"
    size="medium"
  >
    <n-grid cols="1" :x-gap="24">
      <n-form-item-gi label="매장이름" path="userName">
        <n-input
          v-model:value="formModel.userName"
          placeholder="이름을 입력 해주세요"
        />
      </n-form-item-gi>
      <n-form-item-gi label="닉네임" path="displayName">
        <n-input
          v-model:value="formModel.displayName"
          placeholder="닉네임을 입력 해주세요"
        />
      </n-form-item-gi>
      <n-form-item-gi label="이메일" path="email">
        <n-input
          v-model:value="formModel.email"
          placeholder="이메일을 입력 해주세요"
        />
      </n-form-item-gi>
      <n-form-item-gi path="account">
        <bank-account-form @submit:account="onSubmitAccount" />
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>
