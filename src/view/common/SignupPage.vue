<script setup lang="ts">
import { lightTheme } from "naive-ui";
import { lightThemeOver, useNaiveConfig } from "@/composable/config";
import { onBeforeUnmount, ref } from "vue";

import {
  useSignup,
  AsyncUserInfoForm,
  AsyncCompanyInfoForm,
  AsyncShopOperInfoVue,
  AsyncVendorOperInfoVue,
  UserInfoInst,
} from "@/composable";
import { USER_DB, ShopOperInfo, VendorOperInfo } from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";

const { naiveLocate } = useNaiveConfig();
const userInfoRef = ref<UserInfoInst | null>(null);
const companyInfoRef = ref<InstanceType<typeof AsyncCompanyInfoForm> | null>(
  null
);
const shopOperRef = ref<InstanceType<typeof AsyncShopOperInfoVue> | null>(null);
const vendorOperRef = ref<InstanceType<typeof AsyncVendorOperInfoVue> | null>(
  null
);
async function toCompanyInfo() {
  const v = userInfoRef.value;
  if (!v || !user.value) return;
  const { userInfo } = await v.getUserInfo();
  if (!userInfo) return;
  user.value.userInfo = userInfo;
  await USER_DB.updateUser(ioFireStore, user.value);
  step.value = "companyInfo";
}
async function toOperInfo() {
  const v = companyInfoRef.value;
  const u = user.value;
  if (!u || !v) return;
  const { companyInfo } = await v.getCompanyInfo();
  if (!companyInfo) return;
  u.companyInfo = companyInfo;
  await USER_DB.updateUser(ioFireStore, u);
  if (u.userInfo.role === "SHOP") step.value = "shopOperInfo";
  else if (u.userInfo.role === "VENDOR") step.value = "vendorOperInfo";
  else step.value = "term";
}
async function shopToTerm() {
  const v = shopOperRef.value;
  const u = user.value;
  if (!u || !v) return;
  const { shopOperInfo } = await v.getShopOperInfo();
  if (!shopOperInfo) return;
  u.operInfo = shopOperInfo;
  await USER_DB.updateUser(ioFireStore, u);
  step.value = "term";
}
async function vendorToTerm() {
  const v = vendorOperRef.value;
  const u = user.value;
  if (!u || !v) return;
  const { vendorOperInfo } = await v.getVendorOperInfo();
  if (!vendorOperInfo) return;
  u.operInfo = vendorOperInfo;
  await USER_DB.updateUser(ioFireStore, u);
  step.value = "term";
}
const {
  selectRole,
  signupGoogle,
  signupKakao,
  submitEmail,
  router,
  emailFormRef,
  emailModel,
  rules,
  toStepOne,
  step,
  user,
  acceptTerms,
  onSignUp,
  stop,
} = useSignup();
onBeforeUnmount(() => stop());
</script>
<template>
  <n-config-provider
    :locale="naiveLocate.naiveLocale"
    :date-locale="naiveLocate.naiveDate"
    :theme="lightTheme"
    :theme-overrides="lightThemeOver"
  >
    <n-space id="signup-page-container" vertical>
      <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
      <n-card
        style="
          background-color: transparent;
          min-width: 50vw;
          min-height: 30vh;
          justify-content: center;
          align-items: center;
        "
        hoverable
        embedded
      >
        <Transition name="one">
          <n-space
            v-if="step === 'selectRole'"
            justify="center"
            align="center"
            vertical
          >
            <n-p class="txt-small"> 해당되는 역할을 클릭 해주세요! </n-p>
            <n-space justify="center">
              <n-button class="role-btn txt" round @click="selectRole('SHOP')">
                소매
              </n-button>
              <n-button
                class="role-btn txt"
                round
                @click="selectRole('VENDOR')"
              >
                도매
              </n-button>
              <n-button class="role-btn txt" round @click="selectRole('UNCLE')">
                엉클
              </n-button>
            </n-space>
          </n-space>
        </Transition>
        <Transition name="one">
          <n-space v-if="step === 'selectMethod'" vertical align="center">
            <n-p class="txt-small"> 해당되는 역할을 클릭 해주세요! </n-p>
            <n-button
              class="txt-small ellipse-btn"
              strong
              secondary
              round
              @click="step = 'showInputEmail'"
            >
              Sign up with email
            </n-button>
            <n-button
              class="txt-small ellipse-btn"
              strong
              secondary
              round
              @click="signupGoogle"
            >
              Sign up with google
            </n-button>
            <n-button
              class="txt-small ellipse-btn"
              strong
              secondary
              round
              @click="signupKakao"
            >
              Sign up with kakao
            </n-button>
            <n-space>
              <n-gradient-text
                :gradient="{
                  to: 'rgb(170, 170, 170)',
                  from: 'rgb(85, 85, 85)',
                }"
              >
                이미 계정이 있나요?
              </n-gradient-text>
              <n-button
                text
                type="info"
                @click="router.replace({ name: 'Login' })"
              >
                로그인
              </n-button>
            </n-space>
          </n-space>
        </Transition>
        <Transition name="one">
          <n-space v-if="step === 'showInputEmail'" vertical align="center">
            <n-h2>Sign up with email</n-h2>
            <n-form ref="emailFormRef" :model="emailModel" :rules="rules">
              <n-form-item first path="email" :show-label="false">
                <n-input
                  v-model:value="emailModel.email"
                  round
                  size="large"
                  style="width: 30vw"
                  placeholder="이메일 입력"
                  data-test="input-email"
                />
              </n-form-item>
              <n-form-item first path="password" :show-label="false">
                <n-input
                  v-model:value="emailModel.password"
                  round
                  size="large"
                  style="width: 30vw"
                  placeholder="비밀번호 입력"
                  type="password"
                  data-test="input-pw"
                />
              </n-form-item>
            </n-form>
            <n-button class="ellipse-btn" round @click="submitEmail">
              제출
            </n-button>
            <n-button type="info" text @click="toStepOne">
              {{ "<< All signup options" }}
            </n-button>
          </n-space>
        </Transition>
        <Transition name="one">
          <n-card v-if="step === 'userInfo' && user" class="form-card">
            <AsyncUserInfoForm ref="userInfoRef" :u-info="user.userInfo" />
            <template #action>
              <n-button @click="toCompanyInfo">다음</n-button>
            </template>
          </n-card>
        </Transition>
        <Transition name="one">
          <n-card v-if="step === 'companyInfo' && user" class="form-card">
            <AsyncCompanyInfoForm
              ref="companyInfoRef"
              :company-info="user.companyInfo"
              :user-id="user.userInfo.userId"
            />
            <template #action>
              <n-button @click="toOperInfo"> 다음 </n-button>
            </template>
          </n-card>
        </Transition>
        <Transition name="one">
          <n-card v-if="step === 'shopOperInfo' && user" class="form-card">
            <AsyncShopOperInfoVue
              ref="shopOperRef"
              :shop-oper-info="(user.operInfo as ShopOperInfo)"
            />
            <template #action>
              <n-button @click="shopToTerm"> 다음 </n-button>
            </template>
          </n-card>
        </Transition>
        <Transition name="one">
          <n-card v-if="step === 'vendorOperInfo' && user" class="form-card">
            <AsyncVendorOperInfoVue
              ref="vendorOperRef"
              :vendor-oper-info="(user.operInfo as VendorOperInfo)"
            />
            <template #action>
              <n-button @click="vendorToTerm"> 다음 </n-button>
            </template>
          </n-card>
        </Transition>
        <Transition name="two">
          <n-space
            v-if="step === 'term' && user"
            vertical
            align="center"
            style="padding: 3vw"
          >
            <n-image preview-disabled src="/logo.png" width="30" />
            <n-h5 style="color: dimgray"> 히힛 간지러워요! 으익 </n-h5>
            <n-card class="form-card">
              <term-of-service
                style="width: 70vw; height: 40vh; overflow: auto; margin: auto"
              />
              <template #action>
                <n-checkbox v-model:checked="acceptTerms" label="동의" />
              </template>
            </n-card>
            <n-button
              style="margin-top: 3vh; color: white"
              @click.stop="onSignUp"
            >
              가입 완료!
            </n-button>
          </n-space>
        </Transition>
        <Transition name="one">
          <n-space v-if="step === 'doneSignup'" align="center" vertical>
            <n-h1>
              가입 완료!!! <br />
              사장님 믿고 있었다구!
            </n-h1>
            <n-space inline :wrap="false">
              <n-image
                v-for="z in new Array(5)"
                :key="z"
                preview-disabled
                class="vibe"
                src="/logo.png"
                width="60"
              />
            </n-space>
            <n-button
              style="margin-top: 3vh; font-size: larger"
              text
              @click.stop="router.replace({ name: 'Login' })"
            >
              바로 이용하기 >
            </n-button>
          </n-space>
        </Transition>
      </n-card>
    </n-space>
  </n-config-provider>
</template>

<style scoped>
.btn {
  font-size: 1.3rem;
  min-height: 5vh;
  text-decoration: underline;
}
.btn:hover {
  font-size: 1.5vw;
  color: azure;
}
.txt {
  font-size: 1.8rem;
  color: whitesmoke;
}
.txt-small {
  font-size: 1.2rem;
  color: whitesmoke;
}
.ellipse-btn {
  padding: 1.2rem 2.5rem;
}
.role-btn {
  width: 25vw;
  height: 25vw;
  max-width: 300px;
  max-height: 300px;
  min-width: 100px;
  min-height: 100px;
}
#signup-page-container {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
}

.one-enter-active {
  transition: opacity 1s ease 1s;
}
/* .one-leave-active {
  transition: opacity 1s ease;
} */
.one-enter-from,
.one-leave-to {
  opacity: 0;
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
.form-card {
  width: 95vw;
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 1vw;
  padding-left: 1vw;
  justify-content: center;
}
</style>
