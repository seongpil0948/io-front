<script setup lang="ts">
import {
  getIoCollection,
  Locate,
  locateToStr,
  IoUser,
} from "@io-boxies/js-lib";
import { useLocateAppend } from "@/composable";
import { ref } from "vue";
import {
  NText,
  FormInst,
  useMessage,
  NButton,
  NForm,
  NFormItem,
  NInput,
} from "naive-ui";
import { uuidv4 } from "@firebase/util";
import { fireConverter, notNullRule, strLenRule } from "@/util";
import { useAuthStore } from "@/store";
import { setDoc, doc } from "@firebase/firestore";

const auth = useAuthStore();
const virVendorConverter = fireConverter<IoUser>();
const virVendorC = getIoCollection({
  uid: auth.currUser.userInfo.userId,
  c: "VIRTUAL_USER",
}).withConverter(virVendorConverter);
const saveVirVendor = (v: IoUser) =>
  setDoc(doc(virVendorC, v.userInfo.userId), v);
const emits = defineEmits<{
  (e: "submitVirtualVendor", value: IoUser): void;
}>();

const { onClickLocateBtn, showAppendModal } = useLocateAppend();
const formRef = ref<FormInst | null>(null);
const formValue = ref<{ [k: string]: any }>({
  name: undefined,
  phone: undefined,
  locate: undefined,
});
const msg = useMessage();
const rule: { [path: string]: any } = {
  name: strLenRule(2),
  phone: strLenRule(11),
  locate: notNullRule,
};
function onAppendLocate(l: Locate) {
  formValue.value.locate = l;
  showAppendModal.value = false;
}
function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      const v = formValue.value;
      const user: IoUser = {
        userInfo: {
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: uuidv4(),
          providerId: "EMAIL", // FIXME
          emailVerified: false,
          role: "UNCLE_WORKER",
          displayName: v.name,
          userName: v.name,
          phone: v.phone,
          fcmTokens: [],
          passed: false,
        },
        companyInfo: {
          locations: [v.locate],
          shipLocate: v.locate,
          companyName: v.name,
          companyNo: "",
          companyCertificate: [],
          emailTax: "",
          companyPhone: "",
          shopLink: "",
          ceoName: "",
          ceoPhone: "",
          managerName: "",
          managerPhone: "",
        },
      };
      saveVirVendor(user).then(() => {
        msg.success("저장성공");
        emits("submitVirtualVendor", user);
      });
    } else {
      console.log(errors);
      msg.error("올바르게 폼을 작성 해주세요.");
    }
  });
}
</script>
<template>
  <n-form ref="formRef" :label-width="80" :model="formValue" :rules="rule">
    <n-form-item label="도매처 이름" path="name">
      <n-input v-model:value="formValue.name" />
    </n-form-item>
    <n-form-item label="연락처 " path="phone">
      <n-input v-model:value="formValue.phone" />
    </n-form-item>
    <n-form-item label="주소지 " path="locate">
      <n-text v-if="formValue.locate" type="info">
        {{ locateToStr(formValue.locate) }}
      </n-text>
      <n-button v-else @click="onClickLocateBtn"> 가상 도매처 추가 </n-button>
    </n-form-item>
    <n-form-item>
      <n-button @click="handleValidateClick"> 도매처 등록 </n-button>
    </n-form-item>
  </n-form>
  <locate-append-modal
    v-if="showAppendModal"
    v-model:show-append-modal="showAppendModal"
    @append-locate="onAppendLocate"
  />
</template>
