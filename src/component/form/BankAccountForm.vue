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
      return "한국씨티";
    case "SC_JAIL":
      return "제일";
    case "KB_STAR":
      return "국민";
    case "KAKAO":
      return "카카오뱅크";
    case "IBK":
      return "기업";
    case "KDB":
      return "산업";
    case "WOORI":
      return "우리";
    case "BNK":
      return "경남";
    case "KJ":
      return "광주";
    case "DGB":
      return "대구";
    case "Deutsche":
      return "도이치";
    case "BANK_OF_AMERICA":
      return "뱅크오브아메리카";
    case "BUSAN":
      return "부산";
    case "SANRIM":
      return "산림조합중앙회";
    case "MG":
      return "새마을금고";
    case "SUHYUP":
      return "수협";
    case "SINHYUP":
      return "신협중앙회";
    case "WOOCHE":
      return "우체국";
    case "JB_BANK":
      return "전북";
    case "JEJU":
      return "제주";
    case "CCB":
      return "중국건설";
    case "ICBC":
      return "중국공상";
    case "CHINA":
      return "중국";
    case "BNP":
      return "BNP파리바";
    case "HSBC":
      return "HSBC";
    case "JP":
      return "모간체이스";
    case "K_BANK":
      return "케이뱅크";
    case "TOSS":
      return "토스뱅크";
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
    <n-button @click="onSubmit"> 계좌정보 저장 </n-button>
  </n-form>
</template>
