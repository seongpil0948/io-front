<script setup lang="ts">
import { IoUserInfo, catchError, IoAccount } from "@/composable";
import { emailRule, nameLenRule } from "@/util";
import { ioFire } from "@/plugin/firebase";
import { getAuth } from "@firebase/auth";
import { getFcmToken, FcmToken } from "@io-boxies/js-lib";
import { FormInst, useMessage } from "naive-ui";
import { ref, toRefs, watchEffect } from "vue";

const auth = getAuth(ioFire.app);
const props = defineProps<{
  uInfo: IoUserInfo;
}>();
const { uInfo } = toRefs(props);
// const emits = defineEmits<{
//   (e: "update:uInfo", value: IoUserInfo): void;
// }>();
defineExpose({ getUserInfo });
const formRef = ref<FormInst | null>(null);
const formModel = ref<IoUserInfo>(Object.assign({}, uInfo.value));
watchEffect(() => {
  formModel.value = Object.assign({}, uInfo.value, formModel.value);
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
  const defaultVal = { userInfo: undefined };
  return new Promise<{
    userInfo?: IoUserInfo;
  }>((resolve, reject) => {
    if (!formRef.value) return reject("재시도해주세요.");
    formRef.value.validate((errors) => {
      if (errors) {
        return reject("잘못된 양식의 작성입니다.");
      } else if (!accInfo.value) {
        return reject("계좌정보 미입력");
      }
      getFcmToken().then((token) => {
        uInfo.value.account = accInfo.value!;
        uInfo.value.fcmTokens =
          auth.currentUser && token ? [token!] : ([] as FcmToken[]);
        console.info("return uInfo.value", uInfo.value);
        resolve({ userInfo: formModel.value });
      });
    });
  }).catch((err) => {
    catchError({
      err,
      msg,
    });
    console.info("return default", defaultVal);
    return defaultVal;
  });
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
