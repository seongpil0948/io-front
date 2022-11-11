<script setup lang="ts">
import { reactive, ref } from "vue";
import { FormInst } from "naive-ui";
import { Certificate } from "@vicons/carbon";
import { arrLenRule, emailRule, nameLenRule, isMobile } from "@/util";
import { CompanyInfo } from "@/composable";

const props = defineProps<{
  userId: string;
}>();

const formRef = ref<FormInst | null>(null);
const formModel = reactive<{ [k in keyof CompanyInfo]: CompanyInfo[k] }>({
  companyName: "",
  companyNo: "",
  companyCertificate: [],
  locations: [],
  emailTax: "inoutbox@gmail.com",
  companyPhone: "",
  shopLink: "",
  ceoName: "",
  ceoPhone: "",
  managerName: "",
  managerPhone: "",
});
const rule = {
  companyName: nameLenRule,
  companyNo: nameLenRule,
  companyCertificate: arrLenRule(0),
  locations: [],
  emailTax: emailRule,
  companyPhone: nameLenRule,
  shopLink: nameLenRule,
  ceoName: nameLenRule,
  ceoPhone: nameLenRule,
  managerName: nameLenRule,
  managerPhone: nameLenRule,
};

defineExpose({ companyInfo: formModel });
</script>
<template>
  <n-form
    ref="formRef"
    style="height: 50vh; overflow: auto"
    inline
    :label-width="80"
    label-placement="top"
    :model="formModel"
    :rules="rule"
    size="medium"
  >
    <n-grid :cols="isMobile() ? 1 : 2" :x-gap="24">
      <n-form-item-gi label="사업자명" path="companyName">
        <n-input
          v-model:value="formModel.companyName"
          placeholder="ex) 인아웃박스"
        />
      </n-form-item-gi>
      <n-form-item-gi label="사업자등록번호" path="companyNo">
        <n-input
          v-model:value="formModel.companyNo"
          placeholder="사업자등록번호"
        />
      </n-form-item-gi>
      <n-form-item-gi
        span="2"
        :label="`사업자등록증 업로드(${formModel.companyCertificate.length})`"
        path="companyCertificate"
      >
        <single-image-input
          svc="USER"
          elementId="companyCertificate"
          :userId="props.userId"
          v-model:urls="formModel.companyCertificate"
          size="100"
          :max="3"
        >
          <Certificate style="cursor: pointer" />
        </single-image-input>
      </n-form-item-gi>
      <n-form-item-gi label="세금 계산서 이메일 주소" path="emailTax">
        <n-input
          v-model:value="formModel.emailTax"
          placeholder="세금 계산서 이메일 주소"
        />
      </n-form-item-gi>
      <n-form-item-gi span="2" label="사업장 주소" path="locations">
        <user-locate-list v-model:info="formModel" />
        <!-- <n-space justify="space-around">
          <n-tooltip
            trigger="hover"
            v-for="(i, idx) in formModel.locations"
            :key="idx"
          >
            <template #trigger>
              <n-tag round closable @close="onLocateClose(i)">
                {{ i.alias }}</n-tag
              >
            </template>
            {{ locateStr(i) }}
          </n-tooltip>

          <n-button @click="showAppendModal = true">주소지 추가 </n-button>
        </n-space>
        <locate-append-modal
          @appendLocate="onAppendLocate"
          v-model:showAppendModal="showAppendModal"
        /> -->
      </n-form-item-gi>
      <n-form-item-gi label="사업장 연락처" path="companyPhone">
        <n-input
          v-model:value="formModel.companyPhone"
          placeholder="사업장 연락처"
        />
      </n-form-item-gi>
      <n-form-item-gi label="쇼핑몰 링크" path="shopLink">
        <n-input
          v-model:value="formModel.shopLink"
          placeholder="쇼핑몰 링크 입력"
        />
      </n-form-item-gi>
      <n-form-item-gi label="대표자명" path="ceoName">
        <n-input v-model:value="formModel.ceoName" placeholder="대표자이름" />
      </n-form-item-gi>
      <n-form-item-gi label="대표 연락처" path="ceoPhone">
        <n-input
          v-model:value="formModel.ceoPhone"
          placeholder="대표자연락처"
        />
      </n-form-item-gi>
      <n-form-item-gi label="담당자이름" path="managerName">
        <n-input
          v-model:value="formModel.managerName"
          placeholder="담당자이름"
        />
      </n-form-item-gi>
      <n-form-item-gi label="담당자연락처" path="managerPhone">
        <n-input
          v-model:value="formModel.managerPhone"
          placeholder="담당자연락처"
        />
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>
