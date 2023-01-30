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
import { ref, computed, h, watchEffect, shallowRef } from "vue";
import { useLogger } from "vue-logger-plugin";
import { ShopUserGarment } from "../domain";
import { useShopVendorUnits } from "./by-user";

export function useShopGarmentTable(
  briefly: boolean,
  userData = ref<ShopUserGarment[]>([])
) {
  const msg = useMessage();
  const authStore = useAuthStore();
  const shopId = authStore.currUser.userInfo.userId;
  const tableRef = ref<any>(null);
  const dialog = useDialog();
  const openSelectList = ref(false);
  const { rowIdField, userProd, shopProds } = useShopVendorUnits({
    shopId,
  });
  const data = computed(() => {
    const arr = [...userProd.value, ...userData.value];
    return [...new Map(arr.map((item) => [item.shopProdId, item])).values()];
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
            logger.error(shopId, message);
            msg.error(message, makeMsgOpt());
          });
      },
    });
  }
  async function onCheckedDelete() {
    await deleteGarments(shopId, checkedKeys.value);
  }

  const { columns, mapper, checkedKeys, mapperUpdate } = useTable<
    Omit<ShopUserGarment, "account">
  >(
    {
      userId: shopId,
      useChecker: !briefly,
      keyField: rowIdField,
      data,
      siblingFields: ["prodName"],
      onCheckAll: (to) => {
        if (tableRef.value) {
          const idxes = (tableRef.value.paginatedData as any[]).map(
            (x) => x.index
          );
          checkedKeys.value = to
            ? data.value
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
  const { selectedRow, popVal, optionCol } = usePopSelTable<ShopUserGarment>({
    onDelete: (p) => deleteGarments(shopId, [p.shopProdId]),
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
    return !briefly ? [...columns.value, optionCol] : columns.value;
  });
  return {
    tableCols,
    mapper,
    mapperUpdate,
    checkedKeys,
    userProd: data,
    popVal,
    selectedRow,
    selectFunc,
    openSelectList,
    deleteGarments,
    onCheckedDelete,
    tableRef,
    shopProds,
  };
}

export function usePopSelTable<T>(d: {
  onDelete?: (p: T) => Promise<void>;
  onEdit?: (p: T) => void;
}) {
  const selectedRow = shallowRef<T | null>(null);
  const popVal = shallowRef("");

  watchEffect(async () => {
    if (selectedRow.value === null) return;
    else if (d.onDelete && popVal.value === "Delete") {
      await d.onDelete(selectedRow.value);
    } else if (d.onEdit && popVal.value === "Edit") {
      d.onEdit(selectedRow.value);
    }
    popVal.value = "";
  });

  const optionCol = {
    title: "옵션",
    key: "option",
    render: (row: T) =>
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
  };

  return {
    selectedRow,
    popVal,
    optionCol,
  };
}
