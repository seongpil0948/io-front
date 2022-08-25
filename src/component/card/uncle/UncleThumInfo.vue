<script setup lang="ts">
import { IoUser } from "@/composable";
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { computed, onBeforeMount, ref, toRefs } from "vue";
import { useLogger } from "vue-logger-plugin";
import { useRouter } from "vue-router";

const props = defineProps<{
  uncleUser: IoUser;
}>();
const { uncleUser: uncle } = toRefs(props);
const msg = useMessage();
const router = useRouter();
const auth = useAuthStore();
const u = auth.currUser; // shop user
const logger = useLogger();
onBeforeMount(() => {
  if (uncle.value.userInfo.role !== "UNCLE") {
    logger.error(uncle.value.userInfo.userId, "props user is not uncle");
    router.goHome(u);
  } else if (!u.companyInfo!.shipLocate) {
    msg.error("대표 배송지를 설정 해주세요.");
    router.goHome(u);
  }
});
const info = uncle.value.userInfo;
const uInfo = uncle.value.uncleInfo!;
const title = info.displayName ?? info.userName;
const shipAmount = computed(() => {
  const userCode = u.companyInfo!.shipLocate?.code;
  const locates = uncle.value.uncleInfo?.shipLocates ?? [];
  const userLocate = locates.find((x) => x.locate.code === userCode);
  return userLocate ? userLocate.amount.toLocaleString() : "배송불가";
});

function onContact() {
  console.log("On Contact Me: ", u, "with Uncle: ", uncle.value);
}
</script>
<template>
  <n-card
    :title="title"
    :segmented="{
      content: true,
      footer: 'soft',
    }"
  >
    <n-space vertical align="start">
      <n-text type="info">픽업건물</n-text>
      <locate-amount-list :locates="uInfo.pickupLocates" />
      <n-space justify="space-between">
        <n-text type="info">기본 배송료: </n-text>
        <n-text>{{ shipAmount }}</n-text>
      </n-space>
    </n-space>
    <template #action>
      <n-space justify="end">
        <n-button @click="onContact">계약하기</n-button>
      </n-space>
    </template>
  </n-card>
</template>
