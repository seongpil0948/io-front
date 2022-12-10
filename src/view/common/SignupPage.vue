<script setup lang="ts">
import { catchError, useAlarm } from "@/composable";
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
  defineAsyncComponent,
} from "vue";
import { useLogger } from "vue-logger-plugin";
import { useRouter } from "vue-router";
import { IoFireApp } from "@io-boxies/js-lib";
import { logEvent, getAnalytics } from "@firebase/analytics";
import {
  IoUser,
  USER_DB,
  USER_ROLE,
  ShopOperInfo,
  VendorOperInfo,
  USER_PROVIDER,
  getUserName,
} from "@io-boxies/js-lib";
import { createUserWithEmailAndPassword, getAuth } from "@firebase/auth";
import { ioFire } from "@/plugin/firebase";
const UserInfoForm = defineAsyncComponent(
  () => import("@/component/form/UserInfoForm.vue")
);
const CompanyInfoForm = defineAsyncComponent(
  () => import("@/component/form/CompanyInfoForm.vue")
);
const ShopOperInfoVue = defineAsyncComponent(
  () => import("@/component/form/ShopOperInfo.vue")
);
const VendorOperInfoVue = defineAsyncComponent(
  () => import("@/component/form/VendorOperInfo.vue")
);

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

console.log("state:", state);
// if (state.providerId === "EMAIL") {
//   if (!state.email || !state.password) {
//     log.error(null, "email, password not received in signup page", state);
//     router.replace({ name: "Login" });
//   } else if (!state.userId) {
//     state.userId = "";
//   }
// } else {
//   if (!state.userId) {
//     log.error(null, "user id not received in signup page", state);
//     router.replace({ name: "Login" });
//   }
// }

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
      user.value = { userInfo };
      step.value = 5;
    }
    log.debug(null, "userInfo", user.value);
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
  const u = user.value;

  if (!acceptTerms.value) {
    return msg.error("이용약관에 동의 해주세요", makeMsgOpt());
  } else if (!u) {
    log.error(null, "Signup step done, but user value is null");
    return msg.error("(오류) 유저정보가 없습니다.", makeMsgOpt());
  } else if (u.userInfo.providerId === "EMAIL") {
    if (!u.userInfo.email)
      return msg.error("(오류) 이메일이 없습니다.", makeMsgOpt());
    try {
      const credential = await createUserWithEmailAndPassword(
        getAuth(ioFire.app),
        u.userInfo.email,
        state.password
      );
      u.userInfo.userId = credential.user.uid;
      log.info(null, "createUserWithEmailAndPassword: ", credential);
    } catch (e: any) {
      if (typeof e.code === "string") {
        if (e.code.includes("email-already-in-use")) {
          log.debug(
            null,
            `user${u.userInfo.userId} login return in email-already-in-use`
          );
        } else {
          throw e;
        }
      }
    } finally {
      if (!u.userInfo.userId) {
        log.error(null, "u.userInfo.userId is null in signup");
      } else {
        log.debug(u.userInfo.userId, "signup user: ", u);
        await USER_DB.updateUser(u);
        logEvent(getAnalytics(IoFireApp.getInst().app), "sign_up", {
          method: u.userInfo.providerId,
          userRole: u.userInfo.role,
        });
        try {
          msg.success("가입 완료! 사장님 믿고 있었다구!", makeMsgOpt());
          await smtp.sendAlarm({
            toUserIds: [u.userInfo.userId],
            subject: `inoutbox 회원가입 처리내역 알림.`,
            body: `${getUserName(
              u
            )} 께서 제출하신 정보를 바탕으로 계정 검토 및 승인 후 홈페이지 및 어플 이용이 가능합니다.`,
            notiLoadUri: "/",
            uriArgs: {},
          });
        } catch (err) {
          catchError({ err, msg });
        }
        play();
        step.value = 9;
      }
    }
  }
}
</script>
<template>
  <n-config-provider :theme="lightTheme" :theme-overrides="lightThemeOver">
    <n-space id="signup-page-container" vertical>
      <Transition name="one">
        <n-space v-if="step === 1" vertical align="center">
          <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
          <n-h1>
            인-아웃 박스에 <br />
            오신것을 환영 합니다
          </n-h1>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space v-if="step === 2" vertical align="center">
          <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
          <n-h1 style="padding: 1vw">
            쇼핑몰 주문부터 <br />
            픽업 - 상품 정보 정산까지 <br />
            한번에 해결해드립니다!
          </n-h1>
          <n-button text class="btn" @click="step = 3">
            지금 회원가입하기
          </n-button>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space v-if="step === 3" justify="center" align="center" vertical>
          <n-h2 class="txt"> 회원가입 </n-h2>
          <n-p class="txt-small"> 해당되는 역할을 클릭 해주세요! </n-p>
          <n-space justify="center">
            <n-button class="role-btn txt" round @click="selectRole('SHOP')">
              소매
            </n-button>
            <n-button class="role-btn txt" round @click="selectRole('VENDOR')">
              도매
            </n-button>
            <n-button class="role-btn txt" round @click="selectRole('UNCLE')">
              엉클
            </n-button>
          </n-space>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space v-if="step === 4 && userRole !== null" vertical align="center">
          <n-image preview-disabled class="vibe" src="/logo.png" width="30" />
          <n-h5 style="color: dimgray">
            <div>백날 로고를 눌러도 흔들리는 기능 뿐이에요</div>
          </n-h5>
          <n-card class="form-card">
            <!-- state -->
            <user-info-form
              ref="userInfoRef"
              :user-name="(state.userName as string) ?? ''"
              :profile-img="(state.profileImg as string) ?? ''"
              :email="(state.email as string) ?? ''"
              :user-id="(state.userId as string)"
              :provider-id="(state.providerId as USER_PROVIDER)"
              :role="userRole"
            />
            <template #action>
              <n-space justify="end">
                <n-button @click="onStep5"> 다음 </n-button>
                <n-button @click="onPrevToThree"> 이전 </n-button>
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space v-if="step === 5" vertical align="center">
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray">
            아무리 눌러도 흔들리는게 전부에요! :)
          </n-h5>
          <n-card class="form-card">
            <company-info-form
              ref="companyInfoForm"
              :user-id="(state.userId as string)"
            />
            <template #action>
              <n-space justify="end">
                <n-button style="margin-left: auto" @click="onStep6">
                  다음
                </n-button>
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>

      <Transition name="one">
        <n-space
          v-if="step === 6 && user && user.userInfo.role === 'SHOP'"
          vertical
          align="center"
        >
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray"> 히힛 간지러워요! 으익 </n-h5>
          <n-card class="form-card">
            <shop-oper-info-vue ref="shopOperRef" />
            <template #action>
              <n-space justify="end">
                <n-button @click="onStep7"> 다음 </n-button>
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space
          v-if="step === 6 && user && user.userInfo.role === 'VENDOR'"
          vertical
          align="center"
        >
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray"> 히힛 간지러워요! 으익 </n-h5>
          <n-card class="form-card">
            <vendor-oper-info-vue ref="vendorOperRef" />
            <template #action>
              <n-space justify="end">
                <n-button style="margin-left: auto" @click="onStep7">
                  다음
                </n-button>
              </n-space>
            </template>
          </n-card>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space v-if="step === 7" vertical>
          <n-image preview-disabled class="vibe" src="/logo.png" width="100" />
          <n-h2>거의 다 왔어요!</n-h2>
        </n-space>
      </Transition>
      <Transition name="two">
        <n-space v-if="step === 8" vertical align="center" style="padding: 3vw">
          <n-image preview-disabled src="/logo.png" width="30" />
          <n-h5 style="color: dimgray"> 히힛 간지러워요! 으익 </n-h5>
          <n-card class="form-card">
            <term-of-service
              style="width: 70vw; height: 40vh; overflow: auto; margin: auto"
            />
            <template #action>
              <n-space justify="end">
                <n-checkbox v-model:checked="acceptTerms" label="동의" />
              </n-space>
            </template>
          </n-card>
          <n-button
            style="margin-top: 3vh; font-size: 1.1rem"
            @click.stop="onSignUp"
          >
            가입 완료!
          </n-button>
        </n-space>
      </Transition>
      <Transition name="one">
        <n-space v-if="step === 9" align="center" vertical>
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
      <n-card v-if="step > 3 && step < 9" class="form-card">
        <n-steps
          style="overflow-x: auto; max-width: 100%; padding: 1%"
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
          <n-step title="매장 정보 입력" @click="step = 4" />
          <n-step title="사업자 정보 입력" @click="step = 5" />
          <n-step title="운영방식 입력" @click="step = 6" />
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
  width: 25vw;
  height: 25vw;
  max-width: 300px;
  max-height: 300px;
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
