<script setup lang="ts">
import { LocateAmount, Locate } from "@/composable";
import { useAuthStore } from "@/store";
import { useMessage, DataTableColumns, NText, NButton } from "naive-ui";
import { ref, h, computed } from "vue";
import { shipAreas } from "@/asset/administrationAreas";
import { useLogger } from "vue-logger-plugin";

const logger = useLogger();
const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser;
const shipLocates = computed(() =>
  auth.currUser.uncleInfo ? auth.currUser.uncleInfo.shipLocates : []
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
      await u.update();
      msg.success("지역 추가 완료");
    }
  }
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
          onClick: async () => {
            const l = row.locate;
            const idx = u.uncleInfo!.shipLocates.findIndex(
              (e) =>
                l.city === e.locate.city &&
                l.county === e.locate.county &&
                l.town === e.locate.town
            );
            console.log("idx:", idx);
            u.uncleInfo!.shipLocates.splice(idx, 1);
            await u.update();
            msg.success("삭제완료.");
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
    :data="shipLocates"
    :pagination="{ pageSize: 5 }"
  />
</template>
