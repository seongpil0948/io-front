import { SHOP_GARMENT_DB } from "@/composable";
import { useTable } from "@/composable/common";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import {
  DataTableColumns,
  NPopselect,
  NButton,
  useMessage,
  useDialog,
} from "naive-ui";
import { ref, computed, h, watchEffect } from "vue";
import { useLogger } from "vue-logger-plugin";
import { ShopUserGarment } from "../domain";
import { useShopUserGarments } from "./by-user";

export function useShopGarmentTable(briefly: boolean) {
  const msg = useMessage();
  const authStore = useAuthStore();
  const tableRef = ref<any>(null);
  const dialog = useDialog();
  const openSelectList = ref(false);
  const { rowIdField, userProd } = useShopUserGarments({
    shopId: authStore.currUser.userInfo.userId,
  });
  const selectFunc = ref<((s: ShopUserGarment) => Promise<void>) | null>(null);
  const logger = useLogger();

  async function deleteGarments(userId: string, prodIds: string[]) {
    dialog.warning({
      title: "상품 삭제",
      content: "거래중인 상품일 수 있습니다. 그래도 삭제하시겠나요?",
      positiveText: "삭제",
      negativeText: "취소",
      onPositiveClick: async () => {
        SHOP_GARMENT_DB.deleteShopGarments(userId, prodIds)
          .then(() => msg.success("삭제 완료", makeMsgOpt()))
          .catch((err) => {
            const message = `삭제 실패 ${
              err instanceof Error ? err.message : JSON.stringify(err)
            }`;
            logger.error(authStore.currUser.userInfo.userId, message);
            msg.error(message, makeMsgOpt());
          });
      },
    });
  }

  const { columns, mapper, checkedKeys } = useTable<
    Omit<ShopUserGarment, "account">
  >(
    {
      userId: authStore.currUser.userInfo.userId,
      useChecker: !briefly,
      keyField: rowIdField,
      data: userProd,
      siblingFields: ["prodName"],
      onCheckAll: (to) => {
        if (tableRef.value) {
          const idxes = (tableRef.value.paginatedData as any[]).map(
            (x) => x.index
          );
          checkedKeys.value = to
            ? userProd.value
                .filter((o, idx) => idxes.includes(idx))
                .map((p: any) => p[rowIdField])
            : [];
        }
      },
      colKeys: [
        { key: "userName" },
        { key: "titleImgs", imgField: true },
        {
          key: "prodName",
          titleMapping: !briefly,
          cellMapping: !briefly,
          rowIdField,
        },
        { key: "vendorPrice", rowIdField },
        {
          key: "prodPrice",
          titleMapping: !briefly,
          rowIdField,
        },
        {
          key: "color",
          titleMapping: !briefly,
          cellMapping: !briefly,
          rowIdField,
        },
        {
          key: "size",
          titleMapping: !briefly,
          cellMapping: !briefly,
          rowIdField,
        },
        { key: "stockCnt", rowIdField },
        { key: "createdAt", rowIdField },
        { key: "updatedAt", rowIdField },
      ],
    },
    async (p) => {
      if (selectFunc.value) {
        selectFunc.value(p).then(() => (openSelectList.value = false));
      }
    }
  );
  const selectedRow = ref<ShopUserGarment | null>(null);
  const popVal = ref("");
  watchEffect(async () => {
    if (popVal.value === "Delete" && selectedRow.value) {
      await deleteGarments(authStore.currUser.userInfo.userId, [
        selectedRow.value.shopProdId,
      ]);
    }
  });
  const tableCols = computed((): DataTableColumns<ShopUserGarment> => {
    if (mapper.value === null) return [];
    columns.value.forEach((x) => {
      if (["userName", "prodName", "vendorName"].includes(x.key.toString())) {
        x.width = 200;
      } else {
        x.minWidth = 100;
      }
    });
    return !briefly
      ? [
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
        ]
      : columns.value;
  });
  return {
    tableCols,
    mapper,
    checkedKeys,
    userProd,
    popVal,
    selectedRow,
    selectFunc,
    openSelectList,
    deleteGarments,
  };
}
