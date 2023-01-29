<script setup lang="ts">
import { strLenRule } from "@/util";
import { useMessage, FormInst } from "naive-ui";
import { ref } from "vue";

interface IdPw {
  id: string;
  pw: string;
}

const emits = defineEmits<{
  (e: "submit", value: IdPw): void;
}>();

const formRef = ref<FormInst | null>(null);
const msg = useMessage();
const formValue = ref<IdPw>({
  id: "",
  pw: "",
});
const rules = {
  id: strLenRule(3),
  pw: strLenRule(3),
};
async function handleSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      emits("submit", formValue.value);
    } else {
      console.error(errors);
      msg.error("입력폼을 올바르게 입력 해주세요.");
    }
  });
}
</script>

<template>
  <n-card>
    <n-form
      ref="formRef"
      :label-width="80"
      :model="formValue"
      :rules="rules"
      size="large"
    >
      <n-form-item label="ID" path="id">
        <n-input v-model:value="formValue.id" placeholder="ID 입력" />
      </n-form-item>
      <n-form-item label="Password" path="pw">
        <n-input
          v-model:value="formValue.pw"
          placeholder="Password 입력"
          type="password"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item>
        <n-button @click="handleSubmit"> 제출 </n-button>
      </n-form-item>
    </n-form>
  </n-card>
</template>
