<script setup lang="ts">
import { IoUser } from "@io-boxies/js-lib";
import { toRefs } from "vue";
const props = defineProps<{
  user: IoUser;
}>();
const { user } = toRefs(props);
const emits = defineEmits<{
  (e: "update:user", value: IoUser): void;
}>();
</script>

<template>
  <n-card>
    <n-space vertical style="width: 100%">
      <div class="io-row">
        <n-text strong> 업체명 </n-text>
        <n-text>{{ user.companyInfo!.companyName }}</n-text>
      </div>
      <div class="io-row">
        <n-text strong> 사업자 등록번호 </n-text>
        <n-text>{{ user.companyInfo!.companyNo }}</n-text>
      </div>
      <div class="io-row">
        <n-text strong> 대표자명 </n-text>
        <n-text>{{ user.companyInfo!.ceoName }}</n-text>
      </div>
      <div class="io-row">
        <n-text strong> 대표 연락처 </n-text>
        <n-text>{{ user.companyInfo!.ceoPhone }}</n-text>
      </div>
      <n-space justify="space-between">
        <n-text strong> 주소지 </n-text>
        <user-locate-list
          v-model:info="user"
          style="padding: 2%"
          @update:info="emits('update:user', user)"
        />
      </n-space>
      <n-a
        target="_blank"
        rel="noopener noreferrer"
        href="https://docs.google.com/forms/d/e/1FAIpQLSfiqRLuVKfhiIvk6JwuAp-daQ7OQ2_vcQOToxgy7vGDz-4NtQ/viewform"
      >
        정보 변경 요청하기
      </n-a>
    </n-space>
  </n-card>
</template>
