<script setup lang="ts">
import { useTable, useShopUserProds, makeMsgOpt } from "@/composables";
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
const { columns, mapper, checkedKeys } = useTable<ShopUserProd>({
  userId: authStore.currUser.userId,
  useChecker: true,
  keyField: rowIdField,
  onCheckAll: (to) =>
    (checkedKeys.value = to ? userProd.value.map((p) => p[rowIdField]) : []),
  colKeys: [
    { key: "vendorProdName", rowIdField },
    { key: "userName" },
    { key: "titleImgs", imgField: true },
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
  ],
});
let selectedRow = ref<ShopUserProd | null>(null);
let popVal = ref("");
watchEffect(async () => {
  if (popVal.value === "Delete" && selectedRow.value) {
    await deleteShopProds([selectedRow.value.shopProdId])
      .then(() => msg.success("삭제 완료", makeMsgOpt()))
      .catch(() => msg.error("삭제 실패", makeMsgOpt()));
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
async function onCheckedDelete() {
  deleteShopProds(checkedKeys.value)
    .then(() => msg.success("삭제 완료", makeMsgOpt()))
    .catch(() => msg.error("삭제 실패", makeMsgOpt()));
}
function updateOrderId(arr: string[]) {
  mapper?.value?.setSyno("orderId", arr);
}
</script>
<template>
  <n-space vertical>
    <n-card style="width: 80%">
      <template #header>
        상품정보 변경을 위해서 옵션 선택을 이용 해주세요!
      </template>
      <template #header-extra>
        <n-button
          @click="onCheckedDelete"
          size="small"
          round
          type="primary"
          style="margin-right: 5px"
        >
          선택 상품 삭제</n-button
        >
        <n-button size="small" round type="primary"> 선택 상품 주문</n-button>
      </template>
      <n-data-table
        :columns="cols"
        :data="userProd"
        :pagination="{
          pageSize: 10,
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="1200"
      />
    </n-card>
    <n-card>
      <n-h3> 주문번호 매핑</n-h3>
      <n-dynamic-tags
        :value="mapper?.getSyno('orderId')"
        @update:value="updateOrderId"
      />
      <template #action>
        <n-button
          round
          type="primary"
          @click="
            async () =>
              mapper
                ?.update()
                .then(() => msg.success('업데이트 성공', makeMsgOpt()))
                .catch(() => msg.error('업데이트 실패', makeMsgOpt()))
          "
        >
          저장
        </n-button>
      </template>
    </n-card>
  </n-space>
  <shop-prod-modify-modal
    v-if="popVal === 'Edit'"
    v-model:userProd="selectedRow"
    @onClose="selectedRow = null"
  />
</template>
