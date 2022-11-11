<script setup lang="ts">
import {
  IoUser,
  ShopOperInfo,
  USER_PROVIDER,
  USER_ROLE,
  VendorOperInfo,
  useAlarm,
} from "@/composable";
import { makeMsgOpt, useFireWork, isMobile } from "@/util";
import { FormInst, useMessage, useDialog } from "naive-ui";
import { lightTheme } from "naive-ui";
import { lightThemeOver } from "@/composable/config";
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  watchEffect,
} from "vue";
import { useLogger } from "vue-logger-plugin";
import { useRouter } from "vue-router";
import UserInfoForm from "@/component/form/UserInfoForm.vue";
import CompanyInfoForm from "@/component/form/CompanyInfoForm.vue";
import ShopOperInfoVue from "@/component/form/ShopOperInfo.vue";
import VendorOperInfoVue from "@/component/form/VendorOperInfo.vue";
import { analytics } from "@/plugin/firebase";
import { logEvent } from "@firebase/analytics";

const log = useLogger();
const inst = getCurrentInstance();
const msg = useMessage();
const router = useRouter();
const dialog = useDialog();
const step = ref(0);
const userRole = ref<USER_ROLE | null>(null);
const user = ref<IoUser | null>(null);
const acceptTerms = ref(false);
const { play, stop } = useFireWork();
const smtp = useAlarm();
const state = window.history.state;
if (!state.userId) {
  log.error(null, "User ID not Received In SignUp Page(Landing)", state);
  router.replace({ name: "Login" });
}
onMounted(() => {
  if (step.value === 0) {
    setTimeout(() => {
      step.value = 1;
      setTimeout(() => {
        step.value = 0;
        setTimeout(() => {
          step.value = 2;
        }, 1000);
      }, 3500);
    }, 500);
  }
});
watchEffect(() => {
  if (step.value < 8) stop();
});
onBeforeUnmount(() => {
  stop();
});
function onPrevToThree() {
  userRole.value = null;
  step.value = 3;
}
function selectRole(role: USER_ROLE) {
  const isValid = ["SHOP", "VENDOR", "UNCLE"].includes(role);
  const content =
    role === "SHOP"
      ? "쇼핑몰을 운영하는 사장님을 위한 서비스."
      : role === "VENDOR"
      ? "도매업을 운영하는 사장님을 위한 서비스."
      : role === "UNCLE"
      ? "도매시장에서 픽업 및 물류대행을 운영하는 사장님을 위한 서비스."
      : "지원하지 않는 ROLE입니다.";
  dialog.success({
    content,
    positiveText: "선택완료",
    onPositiveClick: () => {
      if (isValid) {
        userRole.value = role;
        step.value = 4;
      }
    },
    showIcon: false,
    closable: false,
    style: {
      width: isMobile() ? "70%" : "45%",
    },
  });
}

async function onStep5() {
  if (!inst) return;
  const userInfoForm = inst.refs.userInfoRef as InstanceType<
    typeof UserInfoForm
  >;
  const { userInfo } = await userInfoForm.getUserInfo();
  const errorMsg = "정보저장 후 다음으로 넘어가주세요!";
  if (!userInfo) return msg.error(errorMsg, makeMsgOpt());
  (userInfoForm.$refs.formRef as FormInst).validate(async (errors) => {
    if (errors) {
      return msg.error(errorMsg, makeMsgOpt());
    } else {
      user.value = new IoUser({ userInfo });
      step.value = 5;
    }
    log.debug("userInfo", user.value);
  });
}

function onStep6() {
  if (!inst || !user.value) return;
  const companyInfoForm = inst.refs.companyInfoForm as InstanceType<
    typeof CompanyInfoForm
  >;
  (companyInfoForm.$refs.formRef as FormInst).validate(async (errors) => {
    if (errors) {
      msg.error("회사정보를 올바르게 입력해주세요", makeMsgOpt());
    } else {
      const companyInfo = companyInfoForm.companyInfo;
      user.value!.companyInfo = companyInfo;
      log.debug("companyInfo: ", companyInfo);
      if (user.value!.userInfo.role === "UNCLE") {
        step.value = 7;
        setTimeout(() => {
          step.value = 8;
        }, 3000);
      } else {
        step.value = 6;
      }
    }
  });
}

function onStep7() {
  if (!inst || !user.value) return;
  if (user.value.userInfo.role === "SHOP") {
    const operForm = inst.refs.shopOperRef as InstanceType<
      typeof ShopOperInfoVue
    >;
    (operForm.$refs.formRef as FormInst).validate(async (errors) => {
      if (errors) {
        msg.error("쇼핑몰 운영정보를 올바르게 입력해주세요", makeMsgOpt());
      } else {
        user.value!.operInfo = operForm.operInfo as ShopOperInfo;
      }
    });
  } else if (user.value.userInfo.role === "VENDOR") {
    const operForm = inst.refs.vendorOperRef as InstanceType<
      typeof VendorOperInfoVue
    >;
    (operForm.$refs.formRef as FormInst).validate(async (errors) => {
      if (errors) {
        msg.error("도매 운영정보를 올바르게 입력해주세요", makeMsgOpt());
      } else {
        user.value!.operInfo = operForm.operInfo as VendorOperInfo;
      }
    });
  }

  step.value = 7;
  setTimeout(() => {
    step.value = 8;
  }, 3000);
}

async function onSignUp() {
  if (!acceptTerms.value) {
    msg.error("이용약관에 동의 해주세요", makeMsgOpt());
    return;
  }
  log.debug(user.value);
  await user.value!.update();
  logEvent(analytics, "sign_up", {
    method: user.value?.userInfo.providerId,
    userRole: user.value?.userInfo.role,
  });
  msg.success("가입 완료! 사장님 믿고 있었다구!", makeMsgOpt());
  await smtp.sendAlarm({
    toUserIds: [user.value!.userInfo.userId],
    subject: `inoutbox 회원가입 처리내역 알림.`,
    body: `${
      user.value!.name
    } 께서 제출하신 정보를 바탕으로 계정 검토 및 승인 후 홈페이지 및 어플 이용이 가능합니다.`,
    notiLoadUri: "/",
    uriArgs: {},
  });
  play();
  step.value = 9;
}
</script>
<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="lightThemeOver">
    <n-space id="signup-page-container" vertical>
      <Transition name="one">
        <n-space vertical align="center" v-if="step === 1">
          <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
          <n-h1
            >인-아웃 박스에 <br />
            오신것을 환영 합니다</n-h1
          >
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space vertical align="center" v-if="step === 2">
          <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
          <n-h1 style="padding: 1vw">
            쇼핑몰 주문부터 <br />
            픽업 - 상품 정보 정산까지 <br />
            한번에 해결해드립니다!
          </n-h1>
          <n-button text @click="step = 3" class="btn">
            지금 회원가입하기</n-button
          >
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space v-if="step === 3" justify="center" align="center" vertical>
          <n-h2 class="txt">회원가입</n-h2>
          <n-p class="txt-small">해당되는 역할을 클릭 해주세요!</n-p>
          <n-space justify="center">
            <n-button @click="selectRole('SHOP')" class="role-btn txt" round
              >쇼핑몰</n-button
            >
            <n-button @click="selectRole('VENDOR')" class="role-btn txt" round
              >도매처</n-button
            >
            <n-button @click="selectRole('UNCLE')" class="role-btn txt" round
              >엉클</n-button
            >
          </n-space>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space vertical align="center" v-if="step === 4 && userRole !== null">
          <n-image preview-disabled class="vibe" src="/logo.png" width="30" />
          <n-h5 style="color: dimgray">
            <div>백날 로고를 눌러도 흔들리는 기능 뿐이에요</div>
          </n-h5>
          <n-card class="form-card">
            <!-- state -->
            <user-info-form
              ref="userInfoRef"
              :userName="(state.userName as string)"
              :profileImg="(state.profileImg as string)"
              :email="(state.email as string)"
              :userId="(state.userId as string)"
              :providerId="(state.providerId as USER_PROVIDER)"
              :role="userRole"
            />
            <template #action>
              <n-space justify="end">
                <n-button @click="onStep5">다음</n-button>
                <n-button @click="onPrevToThree">이전</n-button>
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space vertical align="center" v-if="step === 5">
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray">
            아무리 눌러도 흔들리는게 전부에요! :)
          </n-h5>
          <n-card class="form-card">
            <company-info-form
              ref="companyInfoForm"
              :userId="(state.userId as string)"
            />
            <template #action>
              <n-space justify="end">
                <n-button style="margin-left: auto" @click="onStep6"
                  >다음</n-button
                >
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>

      <Transition name="one">
        <n-space
          vertical
          align="center"
          v-if="step === 6 && user && user.userInfo.role === 'SHOP'"
        >
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray"> 히힛 간지러워요! 으익 </n-h5>
          <n-card class="form-card">
            <shop-oper-info-vue ref="shopOperRef" />
            <template #action>
              <n-space justify="end">
                <n-button @click="onStep7">다음</n-button>
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space
          vertical
          align="center"
          v-if="step === 6 && user && user.userInfo.role === 'VENDOR'"
        >
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray"> 히힛 간지러워요! 으익 </n-h5>
          <n-card class="form-card">
            <vendor-oper-info-vue ref="vendorOperRef" />
            <template #action>
              <n-space justify="end">
                <n-button style="margin-left: auto" @click="onStep7"
                  >다음</n-button
                >
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space vertical v-if="step === 7">
          <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
          <n-h2>거의 다 왔어요!</n-h2>
        </n-space>
      </Transition>
      <Transition name="two">
        <n-space vertical align="center" style="padding: 3vw" v-if="step === 8">
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray"> 히힛 간지러워요! 으익 </n-h5>
          <n-card class="form-card">
            <term-of-service
              style="width: 60vw; height: 40vh; overflow: auto; margin: auto"
            />
            <template #action>
              <n-space justify="end">
                <n-checkbox label="동의" v-model:checked="acceptTerms" />
              </n-space>
            </template>
          </n-card>
          <n-button
            style="margin-top: 3vh; font-size: 1.1rem"
            text
            @click.stop="onSignUp"
          >
            가입 완료!
          </n-button>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space align="center" vertical v-if="step === 9">
          <n-h1
            >가입 완료!!! <br />
            사장님 믿고 있었다구!</n-h1
          >
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
      <n-card class="form-card" v-if="step > 3 && step < 9">
        <n-steps
          style="overflow-x: auto; max-width: 100%"
          :current="(step -3 as number)"
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
          <n-step @click="step = 4" title="매장 정보 입력" />
          <n-step @click="step = 5" title="사업자 정보 입력" />
          <n-step @click="step = 6" title="운영방식 입력" />
          <n-step title="얏호! 믿고있었다구!" />
        </n-steps>
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
.role-btn {
  width: 30vw;
  height: 20vh;
}
#signup-page-container {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
  overflow-y: auto;
}

.one-enter-active {
  transition: opacity 1s ease 1s;
}
.one-leave-active {
  transition: opacity 0.5s ease;
}

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
  width: 80vw;
  justify-content: center;
}
</style>
