<script setup lang="ts">
import { getAuth, sendPasswordResetEmail } from "@firebase/auth";
import { ioFire } from "@/plugin/firebase";
import { ref } from "vue";
import { email as validateEmail } from "@/util/input/validators";
import { useMessage } from "naive-ui";
import { useLogger } from "vue-logger-plugin";

const showModal = ref(false);
const emailInput = ref<string | null>(null);
const msg = useMessage();
const log = useLogger();
function forgetPassword() {
  const e = emailInput.value;
  if (!e || !validateEmail(e))
    return msg.error("올바르게 이메일을 입력 해주십시오.");
  sendPasswordResetEmail(getAuth(ioFire.app), e)
    .then(() => msg.success("이메일이 성공적으로 발송 되었습니다."))
    .catch((e) => {
      if (e.code === "auth/user-not-found") {
        msg.error("유저를 찾을 수 없습니다.");
      } else {
        msg.error("작업중 에러가 발생 했습니다.");
        log.error(
          null,
          `error while sendPasswordResetEmail, email: ${e}, error: `,
          e
        );
      }
    })
    .finally(() => (showModal.value = false));

  // sendPasswordResetEmail
}
</script>

<template>
  <n-button text @click="showModal = true"> 비밀번호를 잊으셨나요? </n-button>
  <n-modal v-model:show="showModal" closable preset="card" style="width: 50vw">
    <n-space vertical align="center">
      <n-p>
        이메일을 입력하시고 보내기 버튼을 클릭 하시면, <br />
        원하시는 비밀번호로 초기화 할 수 있는 메일이 갈 것입니다.
      </n-p>
      <n-input v-model:value="emailInput" placeholder="이메일 입력" />
      <n-button type="primary" @click="forgetPassword">
        제출
      </n-button></n-space
    >
  </n-modal>
</template>
