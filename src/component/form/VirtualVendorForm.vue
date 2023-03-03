<script setup lang="ts">
import { Locate, locateToStr } from "@io-boxies/js-lib";
import { getDefaultUser, usePickArea, IoUser } from "@/composable";
import { ref, watch } from "vue";
import {
  NText,
  FormInst,
  useMessage,
  NButton,
  NForm,
  NFormItem,
  NInput,
} from "naive-ui";
import { fireConverter, notNullRule, strLenRule } from "@/util";
import { useAuthStore } from "@/store";
import { setDoc, doc } from "@firebase/firestore";
import { getIoCollection, ioFireStore } from "@/plugin/firebase";

const auth = useAuthStore();
const virVendorConverter = fireConverter<IoUser>();
const virVendorC = getIoCollection(ioFireStore, {
  uid: auth.currUser().userInfo.userId,
  c: "VIRTUAL_USER",
}).withConverter(virVendorConverter);
const saveVirVendor = (v: IoUser) =>
  setDoc(doc(virVendorC, v.userInfo.userId), v);
const emits = defineEmits<{
  (e: "submitVirtualVendor", value: IoUser): void;
}>();

const formRef = ref<FormInst | null>(null);
const formValue = ref({
  name: undefined,
  phone: undefined,
  locate: undefined as Locate | undefined,
});
const msg = useMessage();
const rule: { [path: string]: any } = {
  name: strLenRule(2),
  phone: strLenRule(9),
  locate: notNullRule,
};

const pickId = ref<string | null>(null);
const addDetailStr = ref<string>("");
const { addPickArea, officeOpt } = usePickArea();
watch(
  () => pickId.value,
  (val) => {
    formValue.value.locate = val ? addPickArea(val) : undefined;
  }
);

function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    const v = formValue.value;
    if (!errors && v.name && v.locate) {
      const user = getDefaultUser("VENDOR", v.name);
      user.userInfo.phone = v.phone;
      if (addDetailStr.value.length > 0) {
        v.locate.detailLocate += `, ${addDetailStr.value}`;
      }
      user.companyInfo!.locations.push(v.locate);
      user.companyInfo!.shipLocate = v.locate;
      user.companyInfo!.companyName = v.name;

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
      <n-space vertical>
        <n-text v-if="formValue.locate" type="info">
          {{ locateToStr(formValue.locate) }}, {{ addDetailStr }}
        </n-text>
        <n-space>
          <pick-area-selector v-model:pickId="pickId" :office-opt="officeOpt" />
          <n-input
            v-model:value="addDetailStr"
            placeholder="ex) 테헤란로 6길 16, 1동 1301호"
          />
        </n-space>
      </n-space>
    </n-form-item>
    <n-form-item>
      <n-button @click="handleValidateClick"> 도매처 등록 </n-button>
    </n-form-item>
  </n-form>
</template>
