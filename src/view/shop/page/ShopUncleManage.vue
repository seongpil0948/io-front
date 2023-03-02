<script setup lang="ts">
import { useAuthStore, useShopOrderStore } from "@/store";
import { IoUser, USER_DB, availUncleAdvertise } from "@/composable";
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NModal,
  NSpace,
  NText,
  useMessage,
} from "naive-ui";
import { computed, onBeforeMount, ref, watch } from "vue";
import { ioFireStore } from "@/plugin/firebase";
import { storeToRefs } from "pinia";
import cloneDeep from "lodash.clonedeep";

const msg = useMessage();
const auth = useAuthStore();
const { user } = storeToRefs(auth);
watch(
  () => user.value,
  (val) => {
    console.log("user in watch: ", val);
  }
);
const availUncles = computed(() =>
  allUncles.value.filter((x) => availUncleAdvertise(x))
);
const otherUncles = computed(() => {
  const uncleIds = auth.contractUncles.map((x) => x.userInfo.userId);
  return availUncles.value.filter((y) => !uncleIds.includes(y.userInfo.userId));
});
const myUncles = computed(() => {
  const uncleIds = auth.contractUncles.map((x) => x.userInfo.userId);
  return availUncles.value.filter((y) => uncleIds.includes(y.userInfo.userId));
});
const allUncles = ref<IoUser[]>([]);
onBeforeMount(async () => {
  allUncles.value = await USER_DB.getUsersByRole(ioFireStore, "UNCLE");
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
  const u = cloneDeep(user.value);
  if (!u || !u.shopInfo || !u.shopInfo.uncleUserIds) return;
  const uId = selectedUser.value!.userInfo.userId;
  u.shopInfo.uncleUserIds.splice(
    u.shopInfo.uncleUserIds.findIndex((x) => x === uId),
    1
  );
  await USER_DB.updateUser(ioFireStore, u);
  auth.setUser(u);
  msg.success("삭제 완료.");
  onClose();
}
async function onContract() {
  const u = cloneDeep(user.value!);
  if (!selectedUser.value || !u || !u.shopInfo || !u.shopInfo.uncleUserIds)
    return;
  const uId = selectedUser.value.userInfo.userId;
  if (!u.shopInfo) {
    u.shopInfo = {
      uncleUserIds: [uId],
    };
  } else if (u.shopInfo.uncleUserIds.includes(uId)) {
    return msg.error("이미 계약된 유저입니다.");
  } else {
    console.log("add userId");
    u.shopInfo.uncleUserIds = [...u.shopInfo.uncleUserIds, uId];
  }

  await USER_DB.updateUser(ioFireStore, u);
  auth.setUser(u);
  msg.success("추가 완료.");
  onClose();
}
function onClose() {
  showModal.value = false;
}

const bodyStyle = {
  width: "600px",
};

const showModal = ref(false);
const shopOrderStore = useShopOrderStore();
const { ioOrders } = storeToRefs(shopOrderStore);
const orderLocates = computed(() => {
  return ioOrders.value.reduce((acc, curr) => {
    const com = curr.vendorProd.companyInfo;
    if (!com || !com.shipLocate) return acc;
    const alias = com.shipLocate.alias;
    if (!acc.includes(alias)) {
      acc.push(alias);
    }
    return acc;
  }, [] as string[]);
});
</script>
<template>
  <n-space vertical>
    <n-space justify="start" inline style="overflow-x: auto; width: 100%">
      <n-p> 주문에 속한 픽업주소 -> </n-p>
      <n-tag
        v-for="(alias, idx) in orderLocates"
        :key="idx"
        :bordered="false"
        type="info"
      >
        {{ alias }}
      </n-tag>
    </n-space>
    <n-card v-if="myUncles.length > 0" title="나의 소중한 엉클들">
      <n-grid
        style="width: 70vw"
        cols="1 s:2 m:2 l:3 xl:4 2xl:6"
        x-gap="24"
        y-gap="12"
        responsive="screen"
      >
        <n-grid-item v-for="(uncle, idx) in myUncles" :key="idx">
          <uncle-thum-info
            :uncle-user="uncle"
            @on-detail="() => onDetail(uncle)"
          />
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
          <uncle-thum-info
            :uncle-user="uncle"
            @on-detail="() => onDetail(uncle)"
          />
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
      <n-space v-if="selectedUser.uncleInfo.shipPendingAmount">
        <ship-pending-amount-tooltip type="info" />
        {{ selectedUser.uncleInfo.shipPendingAmount }}
      </n-space>
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
      <n-space
        v-if="
          selectedUser && user && user.shopInfo && user.shopInfo.uncleUserIds
        "
        justify="space-around"
      >
        <n-button @click="onClose"> 닫기 </n-button>
        <n-button
          v-if="
            !auth.contractUncles
              .map((x) => x.userInfo.userId)
              .includes(selectedUser.userInfo.userId)
          "
          @click="onContract"
        >
          계약하기
        </n-button>
        <n-button v-else @click="onDelete"> 해지하기 </n-button>
      </n-space>
      <n-button v-else @click="onClose"> 닫기 </n-button>
    </template>
  </n-modal>
</template>
