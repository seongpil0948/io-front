<script setup lang="ts">
import { LocateAmount, Locate, usePickArea } from "@/composable";
import { useAuthStore } from "@/store";
import { useMessage, DataTableColumns, NText, NButton } from "naive-ui";
import { ref, h } from "vue";

const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser;
const { data } = usePickArea();
const selectedArea = ref({
  city: null,
  alias: null,
  amount: 10000,
});
async function addShipArea() {
  const v = selectedArea.value;
  const target = data.value.find(
    (x) => x.city === v.city && x.alias === v.alias
  );
  if (!target) {
    msg.error("올바르게 지역을 선택 해주세요.");
    throw new Error(
      "city or alias not matched, is there any duplicate code?" +
        JSON.stringify(v)
    );
  }
  const locate: LocateAmount = {
    locate: new Locate({
      code: target.code,
      alias: v.alias ?? "",
      country: "",
      locateType: "기타",
      city: v.city!,
    }),
    amount: v.amount,
  };

  u.uncleInfo!.pickupLocates.push(locate);
  await u.update();
}
const cols1: DataTableColumns<LocateAmount> = [
  {
    title: "지역",
    key: "locate.alias",
    sorter: "default",
  },
  {
    title: "건물",
    key: "locate.town",
    sorter: "default",
    filter: true,
  },
  {
    title: "요금",
    key: "amount",
    render: (row) => h(NText, { type: "info" }, { default: () => row.amount }),
  },
  {
    title: "삭제",
    key: "delete",
    render: (row) =>
      h(
        NButton,
        {
          type: "error",
          onClick: () => {
            const l = row.locate;
            u.uncleInfo!.pickupLocates.splice(
              u.uncleInfo!.pickupLocates.findIndex(
                (e) => l.city === e.locate.city && l.alias === e.locate.alias
              ),
              1
            );
          },
        },
        { default: () => "삭제" }
      ),
  },
];
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
    <n-button @click="addShipArea">추가</n-button>
  </n-space>
  <n-data-table
    :columns="cols1"
    :data="u.uncleInfo ? u.uncleInfo.pickupLocates : []"
    :pagination="{ pageSize: 5 }"
  />
</template>
