<script setup lang="ts">
import { LocateAmount, usePickArea } from "@/composable";
import { useAuthStore } from "@/store";
import { useMessage, DataTableColumns, NText, NButton } from "naive-ui";
import { ref, h } from "vue";

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
  const lAmount: LocateAmount = {
    locate,
    amount: selectedArea.value.amount,
  };
  u.uncleInfo!.pickupLocates.push(lAmount);
  u.update()
    .then(() => msg.success("성공!"))
    .catch((err) => msg.error(err instanceof Error ? err.message : "실패!"));
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
    title: "건물",
    key: "locate.alias",
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
    <n-button @click="onClickAdd">추가</n-button>
  </n-space>
  <n-data-table
    :columns="cols1"
    :data="u.uncleInfo ? u.uncleInfo.pickupLocates : []"
    :pagination="{ pageSize: 5 }"
  />
</template>
