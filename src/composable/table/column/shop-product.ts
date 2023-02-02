import { useTable, SHOP_GARMENT_DB, usePopSelTable } from "@/composable";
import { ShopUserGarment } from "@/composable/product";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { DataTableColumns, useDialog, useMessage } from "naive-ui";
import { Ref, ref, computed } from "vue";
import { useLogger } from "vue-logger-plugin";

interface ShopProdTableParam {
  briefly: boolean;
  userData: Ref<ShopUserGarment[]>;
  shopId: string;
}
export function useShopProdTable(d: ShopProdTableParam) {
  const rowIdField = "shopProdId";
  const openSelectList = ref(false);
  const selectFunc = ref<((s: ShopUserGarment) => Promise<void>) | null>(null);
  const msg = useMessage();
  const authStore = useAuthStore();
  const tableRef = ref<any>(null);
  const shopId = authStore.currUser.userInfo.userId;
  const dialog = useDialog();
  const logger = useLogger();

  const { columns, mapper, checkedKeys, mapperUpdate } = useTable<
    Omit<ShopUserGarment, "account">
  >(
    {
      userId: d.shopId,
      useChecker: !d.briefly,
      keyField: rowIdField,
      data: d.userData,
      siblingFields: ["prodName"],
      onCheckAll: (to) => {
        if (tableRef.value) {
          const idxes = (tableRef.value.paginatedData as any[]).map(
            (x) => x.index
          );
          checkedKeys.value = to
            ? d.userData.value
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
          titleMapping: !d.briefly,
          cellMapping: !d.briefly,
          rowIdField,
        },
        { key: "vendorPrice", rowIdField },
        {
          key: "prodPrice",
          titleMapping: !d.briefly,
          rowIdField,
        },
        {
          key: "color",
          titleMapping: !d.briefly,
          cellMapping: !d.briefly,
          rowIdField,
        },
        {
          key: "size",
          titleMapping: !d.briefly,
          cellMapping: !d.briefly,
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
  const { selectedRow, popVal, optionCol } = usePopSelTable<ShopUserGarment>({
    onDelete: (p) => deleteGarments(shopId, [p.shopProdId]),
  });
  async function onCheckedDelete() {
    await deleteGarments(shopId, checkedKeys.value);
  }

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
            logger.error(shopId, message);
            msg.error(message, makeMsgOpt());
          });
      },
    });
  }

  const tableCols = computed((): DataTableColumns<ShopUserGarment> => {
    if (mapper.value === null) return [];
    columns.value.forEach((x) => {
      if (["userName", "prodName", "vendorName"].includes(x.key.toString())) {
        x.width = 200;
      } else {
        x.minWidth = 100;
      }
    });
    return !d.briefly ? [...columns.value, optionCol] : columns.value;
  });
  return {
    tableCols,
    mapper,
    mapperUpdate,
    checkedKeys,
    popVal,
    selectedRow,
    selectFunc,
    openSelectList,
    deleteGarments,
    onCheckedDelete,
    tableRef,
    rowIdField,
    msg,
    authStore,
    shopId,
    dialog,
    logger,
  };
}
