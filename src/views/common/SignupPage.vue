<script setup lang="ts">
import UserInfoForm from "@/components/form/UserInfoForm.vue";
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  watchEffect,
} from "vue";
import { FormInst, useMessage } from "naive-ui";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { IoUser, makeMsgOpt, useFireWork } from "@/composables";
import {
  ShopOperInfo,
  USER_ROLE,
  VendorOperInfo,
  type USER_PROVIDER,
} from "@/types";
import CompanyInfoForm from "@/components/form/CompanyInfoForm.vue";
import ShopOperInfoVue from "@/components/form/ShopOperInfo.vue";
import VendorOperInfoVue from "@/components/form/VendorOperInfo.vue";
import { useLogger } from "vue-logger-plugin";

const log = useLogger();
const inst = getCurrentInstance();
const router = useRouter();
if (!router.currentRoute.value.params.userId) {
  log.error(
    null,
    "User ID not Received In SignUp Page(Landing)",
    router.currentRoute.value.params
  );
  router.replace({ name: "Login" });
}

const msg = useMessage();
const { play, stop } = useFireWork();
let step = ref(1);
onMounted(() => {
  setTimeout(() => {
    step.value = 2;
  }, 1000);
});
watchEffect(() => {
  if (step.value < 8) stop();
});
onBeforeUnmount(() => {
  stop();
});

let user = ref<IoUser | null>(null);
let acceptTerms = ref(false);

async function onStep4() {
  if (!inst) return;
  const userInfoForm = inst.refs.userInfoRef as InstanceType<
    typeof UserInfoForm
  >;
  (userInfoForm.$refs.formRef as FormInst).validate(async (errors) => {
    if (errors) {
      msg.error("매장정보를 올바르게 입력해주세요", makeMsgOpt());
    } else {
      user.value = new IoUser({ userInfo: await userInfoForm.getUserInfo() });
      step.value = 4;
    }
    log.debug("userInfo", user.value);
  });
}
function onStep5() {
  if (!inst || !user.value) return;
  const companyInfoForm = inst.refs.comapnyInfoRef as InstanceType<
    typeof CompanyInfoForm
  >;
  (companyInfoForm.$refs.formRef as FormInst).validate(async (errors) => {
    if (errors) {
      msg.error("회사정보를 올바르게 입력해주세요", makeMsgOpt());
    } else {
      const copanyInfo = companyInfoForm.copanyInfo;
      user.value!.copanyInfo = copanyInfo;
      log.debug("copanyInfo: ", copanyInfo);
      step.value = 5;
    }
  });
}
function onStep6() {
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

  step.value = 6;
  setTimeout(() => {
    step.value = 7;
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
  play();
  step.value = 8;
}
</script>
<template>
  <n-space id="signup-page-container" vertical>
    <n-image preview-disabled src="/logo.png" width="30" />
    <n-h5 class="txt" style="color: dimgray">
      <div v-if="step === 1">백날 로고를 눌러도 흔들리는 기능 뿐이에요</div>
      <div v-else-if="step === 2">히힛 간지러워요! 으익</div>
      <div v-else-if="step === 7">동의 후 가입완료!!</div>
      <div v-else-if="step > 2">우리 천천히 하나씩 다 해나아가요 :)</div>
    </n-h5>
    <n-card style="width: 95vw; height: 85vh; overflow-y: auto">
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
        <n-card v-if="step > 2" :bordered="false">
          <Transition name="one">
            <user-info-form
              v-if="step === 3"
              ref="userInfoRef"
              :userName="($route.params.userName as string)"
              :profileImg="($route.params.profileImg as string)"
              :email="($route.params.email as string)"
              :userId="($route.params.userId as string)"
              :providerId="($route.params.providerId as USER_PROVIDER)"
            />
          </Transition>
          <Transition name="two">
            <company-info-form
              v-if="step === 4"
              ref="comapnyInfoRef"
              :userId="($route.params.userId as string)"
            />
          </Transition>
          <Transition
            name="two"
            v-if="step === 5 && user && user.userInfo.role === USER_ROLE.SHOP"
          >
            <shop-oper-info-vue ref="shopOperRef" />
          </Transition>
          <Transition
            name="two"
            v-if="step === 5 && user && user.userInfo.role === USER_ROLE.VENDOR"
          >
            <vendor-oper-info-vue ref="vendorOperRef" />
          </Transition>
          <Transition name="one" v-if="step === 6">
            <n-space vertical>
              <n-image
                preview-disabled
                class="vibe"
                src="/logo.png"
                width="100"
              />
              <n-h2>거의 다 왔어요!</n-h2>
            </n-space>
          </Transition>
          <Transition name="two" v-if="step === 7">
            <div style="padding: 3vw">
              <n-h2>인 아웃 박스 이용 약관</n-h2>
              <n-card>
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
            </div>
          </Transition>
          <Transition name="one" v-if="step === 8">
            <n-space vertical>
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
          <template #action>
            <n-space v-if="step >= 3 && step <= 5" justify="end">
              <n-button v-if="step === 3" @click.stop="onStep4">
                다음
              </n-button>
              <n-button v-else-if="step === 4" @click.stop="onStep5">
                다음
              </n-button>
              <n-button v-else-if="step === 5" @click.stop="onStep6">
                다음
              </n-button>
            </n-space></template
          >
        </n-card>

        <n-steps
          v-if="step > 2"
          :current="(step - 2 as number)"
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
          <n-step @click="step = 3" title="매장 정보 입력" />
          <n-step @click="step = 4" title="사업자 정보 입력" />
          <n-step @click="step = 5" title="운영방식 설정" />
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
