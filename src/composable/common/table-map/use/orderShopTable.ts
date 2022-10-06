import {
  GarmentOrder,
  IoColOpt,
  ProdOrderByVendor,
  ProdOrderCombined,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import {
  DataTableColumns,
  DataTableRowKey,
  NButton,
  NImage,
  useMessage,
  NText,
} from "naive-ui";
import { computed, h, Ref, ref } from "vue";
import { useTable } from "./table";
import ShopOrderCnt from "@/component/input/ShopOrderCnt.vue";
import InfoCell from "@/component/table/InfoCell.vue";
import { write } from "clipboardy";
interface orderTableParam {
  garmentOrders: Ref<ProdOrderCombined[]>;
  orders: Ref<GarmentOrder[]>;
  updateOrderCnt: boolean;
  useChecker?: boolean;
}
export function useOrderTable(d: orderTableParam) {
  const auth = useAuthStore();
  const msg = useMessage();

  const colKeys = [
    "vendorGarment.userInfo.displayName",
    "orderCnt",
    "vendorGarment.vendorPrice",
    "actualAmount.orderAmount",
    "shopGarment.size",
    "shopGarment.color",
  ].map((c) => {
    return { key: c } as IoColOpt;
  });
  const byVendorColKeys = ["vendorName", "orderCnt", "pendingCnt", "phone"].map(
    (c) => {
      return { key: c } as IoColOpt;
    }
  );
  byVendorColKeys.push({
    key: "orderAmount",
    cellRender: (row: ProdOrderByVendor) =>
      h(
        NText,
        {
          type: "info",
        },
        {
          default: () =>
            row.items.reduce(
              (acc, curr) =>
                acc +
                (curr.actualAmount.orderAmount - curr.actualAmount.paidAmount),
              0
            ),
        }
      ),
  });
  byVendorColKeys.push({
    key: "accountStr",
    cellRender: (row: ProdOrderByVendor) =>
      h(
        NButton,
        {
          text: true,
          onClick: () => {
            if (row.accountStr) {
              write(row.accountStr);
              msg.info("복사완료");
            }
          },
        },
        { default: () => row.accountStr }
      ),
  });
  byVendorColKeys.push({
    key: "id",
    cellRender: (row: ProdOrderByVendor) =>
      h(
        NButton,
        {
          text: true,
          onClick: () => onClickDetail(row),
        },
        { default: () => "상세보기" }
      ),
  });

  const tableRef = ref<any>(null);
  const keyField = "id";
  const selectedData = ref<ProdOrderByVendor | null>(null);
  function onClickDetail(data: ProdOrderByVendor) {
    selectedData.value = data;
    console.log("selectedData: ", selectedData.value);
  }
  const { columns: byVendorCol, checkedKeys: byVendorKeys } =
    useTable<ProdOrderByVendor>({
      userId: auth.currUser.userInfo.userId,
      colKeys: byVendorColKeys,
      useChecker: d.useChecker ?? true,
      keyField: "vendorId",
    });

  const {
    columns,
    checkedKeys: checkedDetailKeys,
    mapper,
  } = useTable<ProdOrderCombined>({
    userId: auth.currUser.userInfo.userId,
    colKeys,
    useChecker: d.useChecker ?? true,
    keyField,
    onCheckAll: (to) => {
      if (tableRef.value) {
        const idxes = (tableRef.value.paginatedData as any[]).map(
          (x) => x.index
        );
        checkedDetailKeys.value = to
          ? d.garmentOrders.value
              .filter((o: any, idx: any) => idxes.includes(idx))
              .map((p: { [x: string]: any }) => p[keyField])
          : [];
      }
    },
  });
  const tableCol = computed((): DataTableColumns<ProdOrderCombined> => {
    if (d.updateOrderCnt) {
      columns.value.forEach((x) => {
        if (x.key === "orderCnt") {
          x.title = "주문/미송";
          x.minWidth = "120";
          x.width = "120";
          x.render = (prodOrder: ProdOrderCombined) => {
            const order = d.orders.value.find(
              (o) => o.dbId === prodOrder.orderDbId
            );

            return order
              ? h(ShopOrderCnt, {
                  order,
                  prodOrder,
                  onSubmitPost: () => {
                    !prodOrder.vendorGarment.allowPending
                      ? msg.warning(
                          "해당상품은 미송을 잡을 수 없는 상품입니다.",
                          makeMsgOpt()
                        )
                      : msg.info(
                          `주문개수가 업데이트되었습니다.`,
                          makeMsgOpt()
                        );
                  },
                })
              : "x";
          };
        }
      });
    }

    return columns.value.length > 0
      ? [
          columns.value[0],
          {
            key: "titleImgs",
            title: "이미지",
            render: (x) =>
              h(
                NImage,
                {
                  src: x.vendorGarment?.titleImgs[0] ?? "/img/x.png",
                  width: "50",
                  height: "50",
                },
                {}
              ),
          },
          {
            key: "info",
            title: "상품정보",
            render: (x) =>
              h(
                InfoCell,
                {
                  first: x.shopGarment.prodName,
                  second: x.vendorGarment.vendorProdName,
                  third: x.shopGarment.color + "/" + x.shopGarment.size,
                },
                {}
              ),
          },
          ...columns.value.slice(1),
        ]
      : [];
  });
  const targetIds = computed(() => {
    const itemIds = new Set<string>(
      d.garmentOrders.value
        .filter((x) => checkedDetailKeys.value.includes(x.id))
        .map((y) => y.id)
    );
    if (selectedData.value) {
      selectedData.value.items.forEach((z) => itemIds.add(z.id));
    }
    return itemIds;
  });
  const targetOrdDbIds = computed(() => {
    const orderIds = new Set<string>();
    for (let i = 0; i < d.orders.value.length; i++) {
      const o = d.orders.value[i];

      for (let j = 0; j < o.items.length; j++) {
        const item = o.items[j];
        if (targetIds.value.has(item.id)) {
          orderIds.add(o.dbId);
        }
      }
    }
    return orderIds;
  });
  return {
    tableRef,
    columns,
    tableCol,
    mapper,
    byVendorCol,
    byVendorKeys,
    onClickDetail,
    selectedData,
    checkedDetailKeys,
    targetIds,
    targetOrdDbIds,
  };
}
