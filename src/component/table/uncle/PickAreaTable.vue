<script setup lang="ts">
import { usePickArea, usePickAreaCols, isSamePickLocate } from "@/composable";
import { LocateAmount, USER_DB } from "@io-boxies/js-lib";
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { ref, computed, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";

const msg = useMessage();
const auth = useAuthStore();
const pickAmount = ref(1000);
const pickId = ref<string | null>(null);
const { user } = storeToRefs(auth);
const { addPickArea, unsubscribe } = usePickArea();
onBeforeUnmount(() => unsubscribe());

async function onClickAdd() {
  if (!pickId.value) return msg.error("픽업지역을 선택 해주세요.");
  const locate = addPickArea(pickId.value);
  if (!locate || !user.value) return;
  const lAmount: LocateAmount = {
    locate,
    amount: pickAmount.value,
  };
  if (
    user.value?.uncleInfo!.pickupLocates.some((x) =>
      isSamePickLocate(x.locate, locate)
    )
  ) {
    console.log(`${locate.alias}는 이미 추가한 지역입니다.`, locate);
    msg.error(`${locate.alias}는 이미 추가한 지역입니다.`);
  } else {
    user.value.uncleInfo!.pickupLocates = [
      ...user.value.uncleInfo!.pickupLocates,
      lAmount,
    ];
    USER_DB.updateUser(user.value)
      .then(() => {
        auth.setUser(user.value!);
        msg.success("성공!");
      })
      .catch((err) => msg.error(err instanceof Error ? err.message : "실패!"));
  }
}
const { pickAreaCols } = usePickAreaCols();
const data = computed(() =>
  user.value?.uncleInfo!.pickupLocates.sort(function (a, b) {
    return a.amount - b.amount;
  })
);
</script>
<template>
  <n-space justify="end" style="margin-top: 2.5%; margin-bottom: 2.5%">
    <pick-area-selector v-model:pickId="pickId" />
    <n-input-number
      v-model:value="pickAmount"
      clearable
      placeholder="배송금액"
      :show-button="false"
    />
    <n-button @click="onClickAdd"> 추가 </n-button>
  </n-space>
  <n-data-table
    :columns="pickAreaCols"
    :data="data"
    :pagination="{ pageSize: 5 }"
  />
</template>
