<script setup lang="ts">
import { IoUser, getUserName } from "@/composable";
// import { useCommonStore } from "@/store";
import { formatDate, loadDate } from "@io-boxies/js-lib";
import { toRefs } from "vue";
// import { storeToRefs } from "pinia";
const props = defineProps<{
  user: IoUser;
}>();
const { user: a } = toRefs(props);
// const cs = useCommonStore();
// const { locale } = storeToRefs(cs);
</script>
<template>
  <n-card v-if="a && a.userInfo">
    <n-space vertical>
      <div class="io-row">
        <n-text strong>이름</n-text>
        <n-text type="info">{{ getUserName(a) }}</n-text>
      </div>
      <div v-if="a.userInfo.createdAt" class="io-row">
        <n-text strong>가입일</n-text>
        <n-text type="info">{{
          formatDate(loadDate(a.userInfo.createdAt), "MIN")
        }}</n-text>
      </div>
      <div v-if="a.companyInfo" class="io-row">
        <n-text strong> 상호명 </n-text>
        <n-text type="info">{{ a.companyInfo.companyName }}</n-text>
      </div>
      <div v-if="a.companyInfo" class="io-row">
        <n-text strong> 대표자명 </n-text>
        <n-text type="info">{{ a.companyInfo.ceoName }}</n-text>
      </div>
      <div class="io-row">
        <n-text strong> 이메일 </n-text>
        <n-text type="info">{{ a.userInfo.email }}</n-text>
      </div>
      <div class="io-row">
        <n-text strong> 닉네임 </n-text>
        <n-text type="info">{{ a.userInfo.displayName }}</n-text>
      </div>
    </n-space>
  </n-card>
</template>
