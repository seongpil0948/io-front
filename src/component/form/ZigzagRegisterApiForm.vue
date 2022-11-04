<script setup lang="ts">
import { ApiToken, catchError, LINKAGE_DB } from "@/composable";
import { strLenEqualRule, strLenRule } from "@/util";
import { useMessage, FormInst } from "naive-ui";
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/store";

const emits = defineEmits<{
  (e: "submitToken", value: ApiToken): void;
}>();

const formRef = ref<FormInst | null>(null);
const msg = useMessage();
const auth = useAuthStore();
const formValue = ref({
  alias: "",
  accessKey: "",
  secretKey: "",
});
const rules = {
  alias: strLenRule(3),
  accessKey: strLenEqualRule(36),
  secretKey: strLenEqualRule(40),
};
async function handleSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      const dbId = uuidv4();
      const u = auth.currUser;
      const currDate = new Date();
      const token = new ApiToken({
        dbId,
        createdAt: currDate,
        updatedAt: currDate,
        service: "ZIGZAG",
        userId: u.userInfo.userId,
        alias: formValue.value.alias,
        accessKey: formValue.value.accessKey,
        secretKey: formValue.value.secretKey,
      });
      LINKAGE_DB.createToken(token)
        .then(() => {
          msg.success("등록에 성공 하였습니다.");
          emits("submitToken", token);
        })
        .catch((err) => catchError({ err }));
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
      <n-form-item label="별칭" path="alias">
        <n-input v-model:value="formValue.alias" placeholder="별칭입력" />
      </n-form-item>
      <n-form-item label="Access Key" path="accessKey">
        <n-input
          v-model:value="formValue.accessKey"
          placeholder="Access Key 입력"
        />
      </n-form-item>
      <n-form-item label="Secret Key" path="secretKey">
        <n-input v-model:value="formValue.secretKey" placeholder="Secret Key" />
      </n-form-item>
      <n-form-item>
        <n-button @click="handleSubmit"> 제출 </n-button>
      </n-form-item>
    </n-form>
  </n-card>
</template>
