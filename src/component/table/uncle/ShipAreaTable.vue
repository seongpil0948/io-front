<script setup lang="ts">
import { Locate, useShipAreaCols } from "@/composable";
import { LocateAmount, USER_DB } from "@io-boxies/js-lib";
import { useAuthStore } from "@/store";
import { useMessage, NButton } from "naive-ui";
import { ref, computed } from "vue";
import { shipAreas } from "@/asset/administrationAreas";
import { useLogger } from "vue-logger-plugin";

const logger = useLogger();
const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser;
const shipLocates = computed(() =>
  (auth.currUser.uncleInfo ? auth.currUser.uncleInfo.shipLocates : []).sort(
    function (a, b) {
      return a.amount - b.amount;
    }
  )
);

const selectedArea = ref<{ [k: string]: number | string | null }>({
  city: null,
  county: null,
  town: null,
  amount: 10000,
});
async function addShipArea() {
  const v = selectedArea.value;

  if (!v.county) v.county = "";
  if (!v.town) v.town = "";
  const target = shipAreas.find(
    (x) => x.city === v.city && x.county === v.county && x.town === v.town
  );
  if (!target) {
    msg.error("올바르게 지역을 선택 해주세요.");
    logger.error(
      u.userInfo.userId,
      "city or alias not matched, is there any duplicate code?" +
        JSON.stringify(v)
    );
  } else {
    if (u.uncleInfo!.shipLocates.some((x) => x.locate.code === target.code)) {
      msg.error("이미 추가한 지역입니다.");
    } else {
      const locate: LocateAmount = {
        locate: new Locate({
          code: target.code,
          alias: target.town,
          country: "",
          locateType: "ETC",
          city: v.city as string,
          county: v.county as string,
          town: v.town as string,
        }),
        amount: v.amount as number,
      };
      u.uncleInfo!.shipLocates.push(locate);
      await USER_DB.updateUser(u);
      msg.success("지역 추가 완료");
    }
  }
}
const { shipAreaCols } = useShipAreaCols();
</script>
<template>
  <n-space style="margin-top: 2.5%; margin-bottom: 2.5%">
    <area-selector v-model:area="selectedArea" />
    <n-input-number
      v-model:value="selectedArea.amount"
      clearable
      placeholder="배송금액"
      :show-button="false"
    />
    <n-button @click="addShipArea"> 추가 </n-button>
  </n-space>
  <n-data-table
    :columns="shipAreaCols"
    :data="shipLocates"
    :pagination="{ pageSize: 5 }"
  />
</template>
