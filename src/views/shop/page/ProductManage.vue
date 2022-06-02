<script setup lang="ts">
import { useTable, useShopUserProds } from "@/composables";
import { deleteShopProds } from "@/plugins/firebase";
import { useAuthStore } from "@/stores";
import type { ShopUserProd } from "@/types";
import {
  NButton,
  NPopselect,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { computed, h, ref, watchEffect } from "vue";

const authStore = useAuthStore();
const msg = useMessage();

const { rowIdField, userProd } = useShopUserProds(
  authStore.currUser.userId,
  null
);
const { columns, mapper } = useTable<ShopUserProd>(authStore.currUser.userId, [
  { key: "vendorProdName", rowIdField },
  {
    key: "prodName",
    titleMapping: true,
    cellMapping: true,
    rowIdField,
  },
  { key: "vendorPrice", rowIdField },
  {
    key: "prodPrice",
    titleMapping: true,
    rowIdField,
  },
  {
    key: "color",
    titleMapping: true,
    cellMapping: true,
    rowIdField,
  },
  {
    key: "size",
    titleMapping: true,
    cellMapping: true,
    rowIdField,
  },
  { key: "stockCnt", rowIdField },
]);
let selectedRow = ref<ShopUserProd | null>(null);
let popVal = ref("");
watchEffect(async () => {
  if (popVal.value === "Delete" && selectedRow.value) {
    await deleteShopProds([selectedRow.value.shopProdId])
      .then(() => msg.success("삭제 완료"))
      .catch(() => msg.error("삭제 실패"));
  }
});
const cols = computed((): DataTableColumns<ShopUserProd> => {
  if (mapper.value === null) return [];
  return [
    ...columns.value,
    {
      title: "옵션",
      key: "option",
      render: (row) =>
        h(
          NPopselect,
          {
            value: popVal.value,
            onUpdateValue: (val: string) => {
              popVal.value = val;
              selectedRow.value = row;
            },
            options: [
              {
                label: "수정",
                value: "Edit",
              },
              {
                label: "삭제",
                value: "Delete",
              },
            ],
            scrollable: true,
            // "render-label": (opt: SelectBaseOption) =>
            //   h(NButton, {}, { default: () => opt.label }),
          },
          {
            default: () =>
              h(
                NButton,
                {
                  strong: true,
                  size: "small",
                },
                { default: () => "선택" }
              ),
          }
        ),
    },
  ];
});
</script>
<template>
  <n-card>
    <template #header> ProductManage </template>
    <n-data-table
      :columns="cols"
      :data="userProd"
      :pagination="{
        pageSize: 5,
      }"
      :bordered="false"
    />
  </n-card>
  <shop-prod-modify-modal
    v-if="popVal === 'Edit'"
    v-model:userProd="selectedRow"
    @onClose="selectedRow = null"
  />
</template>
