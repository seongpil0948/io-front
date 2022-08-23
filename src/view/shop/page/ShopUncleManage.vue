<script setup lang="ts">
import { IoUser, USER_DB } from "@/composable";
import { useAuthStore } from "@/store";
import { computed, onBeforeMount, ref } from "vue";

const auth = useAuthStore();
const u = auth.currUser;
const uncles = ref<IoUser[]>([]);
onBeforeMount(async () => {
  const users = await USER_DB.getUsersByRole("UNCLE");
  console.log("users: ", users);
  uncles.value = users.filter((x) => x.availUncleAdvertise);
});
// modal
const selectedUser = ref<IoUser | null>(null);
const title = computed(
  () =>
    selectedUser.value?.userInfo.displayName ??
    selectedUser.value?.userInfo.userName
);
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
      <n-grid-item>
        <n-card class="button-card" style="border-color: #e88080">
          <template #header>
            <n-text style="font-color: #e88080">광고 노출 상태</n-text>
          </template>
          {{ u.availUncleAdvertise ? "활성화" : "비활성화" }}
        </n-card>
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
    <template #footer> Footer </template>
  </n-modal>
</template>
