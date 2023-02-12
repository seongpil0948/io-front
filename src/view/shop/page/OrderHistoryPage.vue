<template>
  <!-- 주문 건별로 (아이템별 X) -->
  <n-space vertical>
    <n-card title="수령 대기 테이블">
      <n-data-table
        :columns="columns"
        :data="data"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
      />
    </n-card>
    <n-card title="수령 완료 내역">
      <n-data-table
        :columns="columns"
        :data="data"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
      />
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { h } from "vue";
import {
  NTag,
  NButton,
  useMessage,
  DataTableColumns,
  useDialog,
} from "naive-ui";
const dialog = useDialog();
function handleConfirm() {
  dialog.warning({
    title: "수령완료 처리 확인",
    content: "진심 수령완료?, 수령완료시 환급될 금액은 300원 입니다.",
    positiveText: "수령완료",
    negativeText: "취소",
    onPositiveClick: () => {
      message.success("Sure");
    },
    onNegativeClick: () => {
      message.error("Not Sure");
    },
  });
}

type RowData = {
  key: number;
  name: string;
  age: number;
  address: string;
  tags: string[];
};

const createColumns = (): DataTableColumns<RowData> => {
  return [
    {
      type: "expand",
      expandable: (rowData) => true,
      renderExpand: (rowData) => {
        return `${rowData.name} is a good guy.`;
      },
    },
    {
      title: "거래일자",
      key: "name",
    },
    {
      title: "상품금액",
      key: "age",
    },
    {
      title: "주문상태",
      key: "address",
    },
    {
      title: "Tags",
      key: "tags",
      render(row) {
        const tags = row.tags.map((tagKey) => {
          return h(
            NTag,
            {
              style: {
                marginRight: "6px",
              },
              type: "info",
              bordered: false,
            },
            {
              default: () => tagKey,
            }
          );
        });
        return tags;
      },
    },
    {
      title: "수령상태",
      key: "actions",
      render(row) {
        return h(
          NButton,
          {
            size: "small",
            onClick: () => {
              handleConfirm();
            },
          },
          { default: () => "수령완료" }
        );
      },
    },
  ];
};

const createData = (): RowData[] => [
  {
    key: 0,
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: 1,
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["wow"],
  },
  {
    key: 2,
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
];
const message = useMessage();
const data = createData();
const columns = createColumns();
</script>
