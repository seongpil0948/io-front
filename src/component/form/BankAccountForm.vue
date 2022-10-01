<script setup lang="ts">
import { IoAccount, IO_BANKS } from "@/composable";
import { ref, computed } from "vue";
import { makeMsgOpt, nameLenRule, notNullRule } from "@/util";
import { type FormInst, useMessage } from "naive-ui";

const formRef = ref<FormInst | null>(null);
const account = ref(IoAccount.empty());
const emits = defineEmits<{
  (e: "submit:account", value: IoAccount): void;
}>();

const msg = useMessage();
async function onSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("올바르게 작성 해주세요", makeMsgOpt());
    emits("submit:account", account.value);
  });
}

function bankToKo(b: IO_BANKS) {
  switch (b) {
    case "NH":
      return "농협";
    case "SHINHAN":
      return "신한";
    case "HANA":
      return "하나";
    case "CITY":
      return "씨티";
    case "SC_JAIL":
      return "제일";
    case "KB_STAR":
      return "국민";
  }
}
const bankOpts = computed(() =>
  Object.values(IO_BANKS).map((x) => {
    return { label: bankToKo(x), value: x };
  })
);

const rules = {
  accountName: nameLenRule,
  accountNumber: nameLenRule,
  bank: notNullRule,
};
</script>
<template>
  <n-form
    ref="formRef"
    :model="account"
    style="width: 100%"
    :rules="rules"
    label-placement="top"
    require-mark-placement="right-hanging"
    label-width="auto"
  >
    <n-form-item label="은행선택" path="bank">
      <n-select
        v-model:value="account.bank"
        placeholder="은행선택"
        :options="bankOpts"
      />
    </n-form-item>

    <n-form-item label="예금주 명" path="accountName">
      <n-input
        v-model:value="account.accountName"
        placeholder="통장에 입력되어있는 성함을 입력해주세요."
      />
    </n-form-item>
    <n-form-item label="계좌번호" path="accountNumber">
      <n-input
        v-model:value="account.accountNumber"
        placeholder="평생 계좌번호를 입력시 송금 받을때 문제가 생길 수 있어요."
      />
    </n-form-item>
    <n-button @click="onSubmit">계좌정보 저장</n-button>
  </n-form>
</template>
