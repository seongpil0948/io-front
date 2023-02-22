<script setup lang="ts">
import { onFirestoreCompletion, onFirestoreErr, ReqEncash } from "@/composable";
import { getIoCollection, ioFireStore } from "@/plugin/firebase";
import { useAuthStore } from "@/store";
import { fireConverter, handleReadSnap } from "@/util/firebase";
import { onSnapshot, query, where } from "@firebase/firestore";
import { formatDate, loadDate } from "@io-boxies/js-lib";
import { NText } from "naive-ui";
import { TableColumns } from "naive-ui/es/data-table/src/interface";
import { h, ref, onBeforeUnmount } from "vue";

const auth = useAuthStore();
const reqEncashConverter = fireConverter<ReqEncash>();
const columns: TableColumns<ReqEncash> = [
  {
    type: "expand",
    expandable: (rowData) => typeof rowData.adminMemo === "string",
    renderExpand: (rowData) => {
      return rowData.adminMemo ? rowData.adminMemo : "-";
    },
  },
  {
    title: "요청액",
    key: "amount",
  },
  {
    title: "상태",
    key: "result",
    render: (row) =>
      h(
        NText,
        {
          type:
            row.result === "approve"
              ? "success"
              : row.result === "rejected"
              ? "error"
              : "default",
        },
        {
          default: () => {
            if (!row.result) return "대기중";
            return row.result === "approve" ? "완료" : "반려";
          },
        }
      ),
  },
  {
    title: "생성일",
    key: "createdAt",
    render: (row) =>
      h(
        NText,
        {},
        {
          default: () => {
            return formatDate(loadDate(row.createdAt), "MIN");
          },
        }
      ),
  },
  {
    title: "허가일",
    key: "approvedAt",
    render: (row) =>
      h(
        NText,
        {},
        {
          default: () => {
            if (!row.approvedAt) return "-";
            return formatDate(loadDate(row.approvedAt), "MIN");
          },
        }
      ),
  },
  {
    title: "반려일",
    key: "rejectedAt",
    render: (row) =>
      h(
        NText,
        {},
        {
          default: () => {
            if (!row.rejectedAt) return "-";
            return formatDate(loadDate(row.rejectedAt), "MIN");
          },
        }
      ),
  },
];
const c = getIoCollection(ioFireStore, { c: "REQUEST_ENCASH" }).withConverter(
  reqEncashConverter
);
const encashList = ref<ReqEncash[]>([]);
const name = "Request Encash List";
const unsubscribe = onSnapshot(
  query(c, where("userId", "==", auth.currUser().userInfo.userId)),
  (snap) => handleReadSnap<ReqEncash>(snap, encashList.value, (x) => x.dbId),
  async (err) => {
    await onFirestoreErr(name, err);
    throw err;
  },
  () => onFirestoreCompletion(name)
);
onBeforeUnmount(() => unsubscribe());
</script>
<template>
  <n-card title="출금 요청내역">
    <template #header-extra>
      최근 100건 조회({{ encashList.length }})
    </template>
    <n-data-table
      ref="table"
      :columns="columns"
      :data="encashList"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50],
      }"
    />
  </n-card>
</template>
