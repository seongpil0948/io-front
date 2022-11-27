<script setup lang="ts">
import { useAuthStore } from "@/store";
import { IoUser, USER_DB, availUncleAdvertise } from "@io-boxies/js-lib";
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NH1,
  NModal,
  NSpace,
  NText,
  useMessage,
} from "naive-ui";
import { computed, onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";

const msg = useMessage();
const auth = useAuthStore();
const { user } = storeToRefs(auth);
const availUncles = computed(() =>
  allUncles.value.filter((x) => availUncleAdvertise(x))
);
const otherUncles = computed(() =>
  availUncles.value.filter(
    (y) => !user.value?.shopInfo?.uncleUserIds.includes(y.userInfo.userId)
  )
);
const myUncles = computed(() =>
  availUncles.value.filter((y) =>
    user.value?.shopInfo?.uncleUserIds.includes(y.userInfo.userId)
  )
);
const allUncles = ref<IoUser[]>([]);
onBeforeMount(async () => {
  if (!user.value) {
    user.value = auth.currUser;
  }
  allUncles.value = await USER_DB.getUsersByRole("UNCLE");
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
async function onDelete() {
  const uId = selectedUser.value!.userInfo.userId;
  user.value!.shopInfo?.uncleUserIds.splice(
    user.value!.shopInfo?.uncleUserIds.findIndex((x) => x === uId),
    1
  );
  await USER_DB.updateUser(user.value!);
  auth.setUser(user.value!);
  msg.success("삭제 완료.");
}
async function onContract() {
  if (!selectedUser.value) return;
  const uId = selectedUser.value.userInfo.userId;
  if (!user.value!.shopInfo) {
    user.value!.shopInfo = {
      uncleUserIds: [uId],
    };
    msg.success("추가 완료.");
  } else if (!user.value!.shopInfo.uncleUserIds.includes(uId)) {
    user.value!.shopInfo?.uncleUserIds.push(uId);
    await USER_DB.updateUser(user.value!);
    auth.setUser(user.value!);
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

const showModal = ref(false);
</script>
<template>
  <n-space vertical>
    <n-card v-if="myUncles.length > 0" title="나의 소중한 엉클들">
      <n-grid
        style="width: 70vw"
        cols="1 s:2 m:2 l:3 xl:4 2xl:6"
        x-gap="24"
        y-gap="12"
        responsive="screen"
      >
        <n-grid-item v-for="(uncle, idx) in myUncles" :key="idx">
          <uncle-thum-info :uncle-user="uncle" @on-detail="onDetail(uncle)" />
        </n-grid-item>
      </n-grid>
    </n-card>
    <n-card v-if="otherUncles.length > 0" title="엉클 찾기">
      <n-grid
        style="width: 70vw"
        cols="1 s:2 m:2 l:3 xl:4 2xl:6"
        x-gap="24"
        y-gap="12"
        responsive="screen"
      >
        <n-grid-item v-for="(uncle, idx) in otherUncles" :key="idx">
          <uncle-thum-info :uncle-user="uncle" @on-detail="onDetail(uncle)" />
        </n-grid-item>
      </n-grid>
    </n-card>
  </n-space>
  <n-modal
    v-model:show="showModal"
    class="custom-card"
    preset="card"
    :style="bodyStyle"
    :title="title"
    :bordered="false"
    size="huge"
  >
    <n-space
      v-if="
        selectedUser &&
        selectedUser.uncleInfo &&
        selectedUser.uncleInfo.pickupLocates
      "
      vertical
    >
      <n-text type="info"> 픽업건물 </n-text>
      <locate-amount-list
        style="padding-bottom: 5%"
        :locates="selectedUser.uncleInfo.pickupLocates"
      />
      <n-text type="info"> 배송지역 </n-text>
      <locate-amount-list
        style="padding-bottom: 5%"
        :locates="selectedUser.uncleInfo.shipLocates"
      />
    </n-space>
    <div
      v-if="
        selectedUser &&
        selectedUser.uncleInfo &&
        selectedUser.uncleInfo.amountBySize
      "
      style="margin-top: 1vh"
    >
      <ship-unit-list :u="selectedUser" :edit="false" unit-key="amountBySize" />
    </div>
    <div
      v-if="
        selectedUser &&
        selectedUser.uncleInfo &&
        selectedUser.uncleInfo.amountByWeight
      "
    >
      <ship-unit-list
        :u="selectedUser"
        :edit="false"
        unit-key="amountByWeight"
      />
    </div>

    <template #action>
      <n-space justify="space-around">
        <n-button @click="onClose"> 닫기 </n-button>
        <n-button
          v-if="
            selectedUser &&
            !user?.shopInfo?.uncleUserIds.includes(selectedUser.userInfo.userId)
          "
          @click="onContract"
        >
          계약하기
        </n-button>
        <n-button v-else @click="onDelete"> 해지하기 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
