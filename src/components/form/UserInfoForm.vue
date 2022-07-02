<script setup lang="ts">
import { emailRule, nameLenRule, IoUser } from "@/composables";
import { IoUserInfo, LocateCRT, USER_PROVIDER, USER_ROLE } from "@/types";
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
}>();
defineExpose({ getUserInfo });
const formRef = ref<FormInst | null>(null);
const formModel = reactive({
  userName: props.userName,
  displayName: "",
  email: props.email,
  role: USER_ROLE.SHOP,
  locations: [] as LocateCRT[],
});
async function getUserInfo(): Promise<IoUserInfo> {
  const token = await IoUser.getFcmToken();
  const obj: IoUserInfo = Object.assign(
    {},
    {
      userId: props.userId,
      providerId: props.providerId,
      emailVerified: false,
      profileImg: props.profileImg,
      passed: false,
      fcmTokens: auth.currentUser ? [token] : [],
    },
    formModel
  );
  return obj;
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
    style="width: 60%"
    inline
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

      <n-form-item-gi label="역할" path="role">
        <n-radio-group v-model:value="formModel.role" name="Role">
          <n-space>
            <n-radio :value="USER_ROLE.SHOP"> 쇼핑몰 </n-radio>
            <n-radio :value="USER_ROLE.VENDOR"> 도매처 </n-radio>
            <n-radio :value="USER_ROLE.UNCLE"> 사입삼춘 </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>
