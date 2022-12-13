<script setup lang="ts">
import { uncleAvailShip } from "@/composable";
import { useAuthStore } from "@/store";
import { IoUser } from "@io-boxies/js-lib";
import { useMessage } from "naive-ui";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, toRefs } from "vue";
import { useLogger } from "vue-logger-plugin";
import { useRouter } from "vue-router";

const props = defineProps<{
  uncleUser: IoUser;
}>();
const { uncleUser: uncle } = toRefs(props);
const msg = useMessage();
const router = useRouter();
const auth = useAuthStore();
const { user: u } = storeToRefs(auth);

const logger = useLogger();
onBeforeMount(() => {
  if (uncle.value.userInfo.role !== "UNCLE") {
    logger.error(uncle.value.userInfo.userId, "props user is not uncle");
    router.goHome(u.value);
  } else if (!u.value?.companyInfo!.shipLocate) {
    msg.error("대표 배송지를 설정 해주세요.");
    router.goHome(u.value);
  }
});
const info = uncle.value.userInfo;
const uInfo = uncle.value.uncleInfo!;
const title = info.displayName ?? info.userName;
const shipAmount = computed(() => {
  const userLocate = u.value?.companyInfo!.shipLocate;
  if (!userLocate) return "배송불가";
  const uncleLocates = uncle.value.uncleInfo?.shipLocates ?? [];
  const availLocate = uncleLocates.find((x) =>
    uncleAvailShip(x.locate, userLocate)
  );
  return availLocate ? availLocate.amount.toLocaleString() : "배송불가";
});

const emits = defineEmits<{
  (e: "onDetail"): void;
}>();

function onDetail() {
  emits("onDetail");
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
      <n-text type="info"> 픽업건물 </n-text>
      <locate-amount-list
        style="padding-bottom: 5%"
        :locates="uInfo.pickupLocates"
      />
      <n-space justify="space-between">
        <n-text type="info"> 기본 배송료: </n-text>
        <n-text>{{ shipAmount }}</n-text>
      </n-space>
    </n-space>
    <template #action>
      <n-space justify="end">
        <n-button @click="onDetail"> 상세보기 </n-button>
      </n-space>
    </template>
  </n-card>
</template>
