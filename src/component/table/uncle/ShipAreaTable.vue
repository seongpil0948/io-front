<script setup lang="ts">
import { LocateAmount, Locate } from "@/composable";
import { useAuthStore } from "@/store";
import { useMessage, DataTableColumns, NText, NButton } from "naive-ui";
import { ref, h } from "vue";
import { shipAreas } from "@/asset/administrationAreas";
const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser;

const selectedArea = ref({
  city: null,
  county: null,
  town: null,
  amount: 10000,
});
async function addShipArea() {
  const v = selectedArea.value;
  const target = shipAreas.find(
    (x) => x.city === v.city && x.county === v.county && x.town === v.town
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
      alias: target.town,
      country: "",
      locateType: "ETC",
      city: v.city!,
      county: v.county ?? "",
      town: v.town ?? "",
    }),
    amount: v.amount,
  };
  u.uncleInfo!.shipLocates.push(locate);

  await u.update();
}
const cols1: DataTableColumns<LocateAmount> = [
  {
    title: "도",
    key: "locate.city",
    sorter(rowA, rowB) {
      return rowA.locate.city!.length - rowB.locate.city!.length;
    },
  },
  {
    title: "시",
    key: "locate.county",
    sorter(rowA, rowB) {
      return rowA.locate.county!.length - rowB.locate.county!.length;
    },
  },
  {
    title: "군/구",
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
            u.uncleInfo!.shipLocates.splice(
              u.uncleInfo!.shipLocates.findIndex(
                (e) =>
                  l.city === e.locate.city &&
                  l.county === e.locate.county &&
                  l.town === e.locate.town
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
    <area-selector v-model:area="selectedArea" />
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
    :data="u.uncleInfo ? u.uncleInfo.shipLocates : []"
    :pagination="{ pageSize: 5 }"
  />
</template>