<script setup lang="ts">
import { IoUser, usePopSelTable } from "@/composable";
import { makeMsgOpt } from "@/util";
import { useMessage, DataTableColumns, NTooltip } from "naive-ui";
import { h } from "vue";
import { storeToRefs } from "pinia";
import { useUncleOrderStore } from "@/store";

const msg = useMessage();
const uncleStore = useUncleOrderStore();
const { workers } = storeToRefs(uncleStore);

const { optionCol } = usePopSelTable<IoUser>({
  onDelete: (p) => {
    console.log("onDelete: ", p);
    msg.info("준비중.. 찡끗 ㅇ_<", makeMsgOpt());
    return Promise.resolve();
  },

  onEdit: () => msg.info("준비중.. 찡끗 ㅇ_<", makeMsgOpt()),
});
const workersCols: DataTableColumns<IoUser> = [
  {
    title: "이름",
    key: "userInfo.displayName",
  },
  {
    title: "연락처",
    key: "userInfo.phone",
  },
  {
    title: "이메일",
    key: "userInfo.email",
  },
  optionCol,
  {
    title: "계좌",
    key: "account",
    render: (row) =>
      h(
        NTooltip,
        {},
        {
          trigger: () => row.userInfo.account?.accountName ?? "-",
          default: () =>
            row.userInfo.account
              ? `${row.userInfo.account.bank}/${row.userInfo.account.accountName}/${row.userInfo.account.accountNumber}`
              : "-",
        }
      ),
  },
];
</script>

<template>
  <n-card title="근로자 조회">
    <n-data-table
      :columns="workersCols"
      :data="workers"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
</template>
