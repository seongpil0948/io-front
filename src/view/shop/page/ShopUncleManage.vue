<script setup lang="ts">
import { IoUser, USER_DB } from "@/composable";
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { computed, onBeforeMount, ref } from "vue";

const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser;
const uncles = ref<IoUser[]>([]);
onBeforeMount(async () => {
  const users = await USER_DB.getUsersByRole("UNCLE");
  uncles.value = users.filter((x) => x.availUncleAdvertise);
});
// modal
const selectedUser = ref<IoUser | null>(null);
const title = computed(
  () =>
    selectedUser.value?.userInfo.displayName ??
    selectedUser.value?.userInfo.userName
);
function onDetail(uncle: IoUser) {
  selectedUser.value = uncle;
  showModal.value = true;
}
async function onContract() {
  if (!selectedUser.value) return;
  const uId = selectedUser.value.userInfo.userId;
  if (!u.shopInfo) {
    u.shopInfo = {
      uncleUserIds: [uId],
    };
    msg.success("추가 완료.");
  } else if (!u.shopInfo.uncleUserIds.includes(uId)) {
    u.shopInfo?.uncleUserIds.push(uId);
    await u.update();
    msg.success("추가 완료.");
  } else {
    msg.error("이미 계약된 유저입니다.");
  }
  showModal.value = false;
}
function onClose() {
  showModal.value = false;
}

const bodyStyle = {
  width: "600px",
};
const segmented = {
  content: "soft",
  footer: "soft",
};
const showModal = ref(false);
</script>
<template>
  <n-h1>엉클 리스트</n-h1>
  <n-card>
    <n-grid
      style="width: 70vw"
      cols="1 s:2 m:2 l:3 xl:4 2xl:6"
      x-gap="24"
      y-gap="12"
      responsive="screen"
    >
      <n-grid-item v-for="(uncle, idx) in uncles" :key="idx">
        <uncle-thum-info @onDetail="onDetail(uncle)" :uncleUser="uncle" />
      </n-grid-item>
    </n-grid>
  </n-card>
  <n-modal
    v-model:show="showModal"
    class="custom-card"
    preset="card"
    :style="bodyStyle"
    :title="title"
    :bordered="false"
    size="huge"
    :segmented="segmented"
  >
    <template #header-extra> Oops! </template>
    Content
    <template #action>
      <n-space justify="space-around">
        <n-button @click="onClose">닫기</n-button>
        <n-button @click="onContract">계약하기</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
