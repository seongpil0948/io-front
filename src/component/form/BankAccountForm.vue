<script setup lang="ts">
import { emptyAccount, IO_BANKS, IoAccount } from "@/composable";
import { ref, computed, toRefs, watch } from "vue";
import { makeMsgOpt, nameLenRule, notNullRule } from "@/util";
import { type FormInst, useMessage } from "naive-ui";

const props = withDefaults(
  defineProps<{
    acc?: IoAccount;
    useSubmit: boolean;
  }>(),
  {
    acc: undefined,
    useSubmit: true,
  }
);
const { acc } = toRefs(props);
const formRef = ref<FormInst | null>(null);
const account = ref(acc?.value ?? emptyAccount());
const emits = defineEmits<{
  (e: "submit:account", value: IoAccount): void;
  (e: "update:acc", value: IoAccount): void;
}>();

const msg = useMessage();
async function onSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("올바르게 작성 해주세요", makeMsgOpt());
    else if (!account.value.bank || !IO_BANKS[account.value.bank]) {
      return msg.error("은행을 올바르게 선택 해주세요.");
    }
    account.value.code = IO_BANKS[account.value.bank];
    emits("submit:account", account.value);
  });
}
watch(
  () => account.value,
  (acc) => {
    if (acc) {
      emits("update:acc", acc);
    }
  },
  { deep: true }
);

const bankOpts = computed(() =>
  Object.keys(IO_BANKS).map((ko) => {
    return { label: ko, value: ko };
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
    <n-button v-if="useSubmit" @click="onSubmit"> 계좌정보 저장 </n-button>
  </n-form>
</template>
