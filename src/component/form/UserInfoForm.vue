<script setup lang="ts">
import { IoAccount } from "@/composable";
import { emailRule, nameLenRule } from "@/util";
import { ioFire } from "@/plugin/firebase";
import { getAuth } from "@firebase/auth";
import {
  USER_PROVIDER,
  USER_ROLE,
  IoUserInfo,
  getFcmToken,
  FcmToken,
  Locate,
} from "@io-boxies/js-lib";
import { FormInst, useMessage } from "naive-ui";
import { ref } from "vue";

const auth = getAuth(ioFire.app);
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
const formModel = ref({
  userName: props.userName ?? "",
  displayName: "",
  email: props.email ?? "",
  locations: [] as Locate[],
});
const accInfo = ref<IoAccount | null>(null);
const msg = useMessage();
function onSubmitAccount(acc: IoAccount) {
  accInfo.value = acc;
  msg.info("계좌정보 저장 완료!");
}
async function getUserInfo(): Promise<{
  userInfo?: IoUserInfo;
}> {
  if (!accInfo.value) return { userInfo: undefined };
  const token = await getFcmToken();

  const obj: IoUserInfo = Object.assign(
    { account: accInfo.value! },
    {
      userId: props.userId,
      providerId: props.providerId,
      emailVerified: false,
      profileImg: props.profileImg,
      passed: false,
      fcmTokens: auth.currentUser && token ? [token!] : ([] as FcmToken[]),
      role: props.role,
    },
    formModel.value
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
      <n-form-item-gi label="쇼핑몰 명" path="userName">
        <n-input
          v-model:value="formModel.userName"
          placeholder="쇼핑몰 명을 입력 해주세요"
        />
      </n-form-item-gi>
      <n-form-item-gi label="담당자 이름" path="displayName">
        <n-input
          v-model:value="formModel.displayName"
          placeholder="담당자 이름을 입력 해주세요"
        />
      </n-form-item-gi>
      <n-form-item-gi label="이메일" path="email">
        <n-input v-model:value="formModel.email" disabled />
      </n-form-item-gi>
      <n-form-item-gi path="account">
        <bank-account-form @submit:account="onSubmitAccount" />
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>
