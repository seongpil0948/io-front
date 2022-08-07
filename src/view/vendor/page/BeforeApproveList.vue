<script setup lang="ts">
import { NButton, useMessage, DataTableColumns } from "naive-ui";
// const auth = useAuthStore();
// const { orders, garmentOrders, garmentOrdersByShop } = useReadVendorOrderGInfo(
//   auth.currUser.userInfo.userId,
//   [],
//   []
// );
type Song = {
  no: number;
  title: string;
  length: string;
};

const createColumns = ({
  play,
}: {
  play: (row: Song) => void;
}): DataTableColumns<Song> => {
  return [
    {
      title: "No",
      key: "no",
    },
    {
      title: "Title",
      key: "title",
    },
    {
      title: "Length",
      key: "length",
    },
  ];
};

const data: Song[] = [
  { no: 3, title: "Wonderwall", length: "4:18" },
  { no: 4, title: "Don't Look Back in Anger", length: "4:48" },
  { no: 12, title: "Champagne Supernova", length: "7:27" },
];

const message = useMessage();
const columns = createColumns({
  play(row: Song) {
    message.info(`Play ${row.title}`);
  },
});
const pagination = false;
</script>
<template>
  <n-space vertical align="center" justify="center">
    <n-card style="width: 50vw">
      <template #header>
        <n-space justify="start"> <n-h2>거래처 주문 요청</n-h2> </n-space>
      </template>
      <template #header-extra>
        <n-space justify="space-between">
          <n-button text class="under-bar"> 선택 승인 </n-button>
          <n-button text class="under-bar"> 선택 거부 </n-button>
          <n-button text class="under-bar"> 전체 승인 </n-button>
        </n-space>
      </template>
      <n-data-table
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :bordered="false"
      />
    </n-card>
    <n-card style="width: 50vw">
      <template #header>
        <n-space justify="start"> <n-h2>상세보기</n-h2> </n-space>
      </template>
      <template #header-extra>
        <n-space justify="space-between">
          <n-button text class="under-bar"> 부분미송 </n-button>
        </n-space>
      </template>
      <n-data-table
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :bordered="false"
      />
    </n-card>
  </n-space>
</template>
<style scoped>
.under-bar {
  font-size: 1.2rem;
}
</style>
