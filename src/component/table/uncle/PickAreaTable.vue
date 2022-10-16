<script setup lang="ts">
import { LocateAmount, usePickArea, usePickAreaCols } from "@/composable";
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { ref } from "vue";

const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser;

const selectedArea = ref({
  code: null,
  alias: null,
  amount: 10000,
});
const { addPickArea } = usePickArea(selectedArea);

async function onClickAdd() {
  const locate = addPickArea();
  if (!locate) return;
  const lAmount: LocateAmount = {
    locate,
    amount: selectedArea.value.amount,
  };
  if (u.uncleInfo!.pickupLocates.some((x) => x.locate.code === locate.code)) {
    msg.error("이미 추가한 지역입니다.");
  } else {
    u.uncleInfo!.pickupLocates.push(lAmount);
    u.update()
      .then(() => msg.success("성공!"))
      .catch((err) => msg.error(err instanceof Error ? err.message : "실패!"));
  }
}
const { pickAreaCols } = usePickAreaCols();
</script>
<template>
  <n-space style="margin-top: 2.5%; margin-bottom: 2.5%">
    <pick-area-selector v-model:area="selectedArea" />
    <n-input-number
      v-model:value="selectedArea.amount"
      clearable
      placeholder="배송금액"
      :show-button="false"
    />
    <n-button @click="onClickAdd">추가</n-button>
  </n-space>
  <n-data-table
    :columns="pickAreaCols"
    :data="u.uncleInfo ? u.uncleInfo.pickupLocates : []"
    :pagination="{ pageSize: 5 }"
  />
</template>
