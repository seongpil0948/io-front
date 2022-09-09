<script setup lang="ts">
import {
  IoUser,
  ShopOperInfo,
  USER_PROVIDER,
  USER_ROLE,
  VendorOperInfo,
  useAlarm,
} from "@/composable";
import { makeMsgOpt, useFireWork } from "@/util";
import { FormInst, useMessage } from "naive-ui";
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

const log = useLogger();
const inst = getCurrentInstance();
const msg = useMessage();
const router = useRouter();
const step = ref(0);
const userRole = ref<USER_ROLE | null>(null);
const user = ref<IoUser | null>(null);
const acceptTerms = ref(false);
const { play, stop } = useFireWork();
const smtp = useAlarm();
if (!router.currentRoute.value.params.userId) {
  log.error(
    null,
    "User ID not Received In SignUp Page(Landing)",
    router.currentRoute.value.params
  );
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
function selectRole(role: USER_ROLE) {
  userRole.value = role;
  step.value = 4;
}

async function onStep5() {
  if (!inst) return;
  const userInfoForm = inst.refs.userInfoRef as InstanceType<
    typeof UserInfoForm
  >;
  const { userInfo } = await userInfoForm.getUserInfo();
  const errorMsg = "유저정보를 올바르게 입력 또는 계좌제출을 해주세요.";
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
      if (user.value!.userInfo.role === USER_ROLE.UNCLE) {
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
  if (user.value.userInfo.role === USER_ROLE.SHOP) {
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
  } else if (user.value.userInfo.role === USER_ROLE.VENDOR) {
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
  msg.success("가입 완료! 사장님 믿고 있었다구!", makeMsgOpt());
  await smtp.sendAlarm({
    toUserIds: [user.value!.userInfo.userId],
    subject: `inoutbox 회원가입 처리내역 알림.`,
    body: `${
      user.value!.name
    } 께서 제출하신 정보를 바탕으로 계정 검토 및 승인 후 홈페이지 및 어플 이용이 가능합니다.
    처리된 내용에 문의가 있으실 경우 해당 거래처에 문의하시면 보다 자세한 답변을 받아보실 수 있습니다.
    해당 메일은 회신이 불가한 메일입니다.
    `,
    notiLoadUri: "/",
    uriArgs: {},
  });
  play();
  step.value = 9;
}
</script>
<template>
  <n-space id="signup-page-container" vertical>
    <Transition name="one">
      <n-space vertical align="center" v-if="step === 1">
        <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
        <n-h1>인-아웃 박스에 오신것을 환영 합니다</n-h1>
      </n-space>
    </Transition>
    <Transition name="one">
      <n-space vertical align="center" v-if="step === 2">
        <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
        <n-h1 style="padding: 1vw">
          쇼핑몰 주문부터 픽업 - 상품 정보 정산까지 한번에 해결해드립니다!
        </n-h1>
        <n-button text @click="step = 3" class="btn">
          지금 회원가입하기</n-button
        >
      </n-space>
    </Transition>
    <Transition name="one">
      <n-space v-if="step === 3" justify="center" align="center" vertical>
        <n-h1>회원가입</n-h1>
        <n-space justify="center">
          <n-button @click="selectRole(USER_ROLE.SHOP)" class="role-btn" round
            >쇼핑몰</n-button
          >
          <n-button @click="selectRole(USER_ROLE.VENDOR)" class="role-btn" round
            >도매처</n-button
          >
          <n-button @click="selectRole(USER_ROLE.UNCLE)" class="role-btn" round
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
          <user-info-form
            ref="userInfoRef"
            :userName="($route.params.userName as string)"
            :profileImg="($route.params.profileImg as string)"
            :email="($route.params.email as string)"
            :userId="($route.params.userId as string)"
            :providerId="($route.params.providerId as USER_PROVIDER)"
            :role="userRole"
          />
          <template #action>
            <n-space justify="end">
              <n-button style="margin-left: auto" @click="onStep5"
                >다음</n-button
              >
            </n-space>
          </template>
        </n-card>
      </n-space>
    </Transition>
    <Transition name="one">
      <n-space vertical align="center" v-if="step === 5">
        <n-image preview-disabled src="/logo.png" width="30" />
        <n-h5 style="color: dimgray">
          우리 천천히 하나씩 다 해나아가요 :)
        </n-h5>
        <n-card class="form-card">
          <company-info-form
            ref="companyInfoForm"
            :userId="($route.params.userId as string)"
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
        v-if="step === 6 && user && user.userInfo.role === USER_ROLE.SHOP"
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
        v-if="step === 6 && user && user.userInfo.role === USER_ROLE.VENDOR"
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
        <n-card class="form-card" title="인 아웃 박스 이용 약관">
          <n-text>이용약관 어쩌구 저쩌구 </n-text>
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
        :current="(step -3 as number)"
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
        <n-step @click="step = 4" title="매장 정보 입력" />
        <n-step @click="step = 5" title="사업자 정보 입력" />
        <n-step @click="step = 6" title="운영방식 설정" />
        <n-step title="가입완료" />
      </n-steps>
    </n-card>
  </n-space>
</template>

<style scoped>
.btn {
  font-size: 1.5vw;
  min-height: 5vh;
  text-decoration: underline;
}
.btn:hover {
  font-size: 1.5vw;
  color: azure;
}
.role-btn {
  font-size: 5vh;
  width: 30vw;
  height: 30vw;
}
#signup-page-container {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
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
  width: 70vw;
  justify-content: center;
}
</style>
