import {
  IoOrder,
  IoColOpt,
  ORDER_STATE,
  OrderItemByVendor,
  OrderItemCombined,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { DataTableColumns, NButton, NImage, useMessage, NText } from "naive-ui";
import { computed, h, Ref, ref, defineAsyncComponent } from "vue";
import { useTable } from "./table";
import clip from "clipboardy";

const ShopOrderCnt = defineAsyncComponent(
  () => import("@/component/input/ShopOrderCnt.vue")
);
const InfoCell = defineAsyncComponent(
  () => import("@/component/table/InfoCell.vue")
);

interface orderTableParam {
  garmentOrders: Ref<OrderItemCombined[]>;
  orders: Ref<IoOrder[]>;
  updateOrderCnt: boolean;
  useChecker?: boolean;
  useAccountStr?: boolean;
  useState?: boolean;
}
export function useOrderTable(d: orderTableParam) {
  const auth = useAuthStore();
  const msg = useMessage();

  const colKeys = [
    "vendorProd.userInfo.displayName",
    "orderCnt",
    "vendorProd.vendorPrice",
    "amount.orderAmount",
    "shopProd.size",
    "shopProd.color",
  ].map((c) => {
    return { key: c } as IoColOpt;
  });
  const byVendorColKeys = ["vendorName", "orderCnt", "pendingCnt", "phone"].map(
    (c) => {
      return { key: c } as IoColOpt;
    }
  );
  if (d.useAccountStr === undefined || d.useAccountStr === true)
    byVendorColKeys.push({
      key: "accountStr",
      cellRender: (row: OrderItemByVendor) =>
        h(
          NButton,
          {
            text: true,
            onClick: async () => {
              if (row.accountStr) {
                await clip.write(row.accountStr);
                msg.info("복사완료");
              }
            },
          },
          { default: () => row.accountStr }
        ),
    });
  byVendorColKeys.push({
    key: "id",
    colRender: () => h(NText, {}, { default: () => "주문내역" }),
    cellRender: (row: OrderItemByVendor) =>
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
  const selectedData = ref<OrderItemByVendor | null>(null);
  function onClickDetail(data: OrderItemByVendor) {
    selectedData.value = data;
  }
  const { columns: byVendorCol, checkedKeys: byVendorKeys } =
    useTable<OrderItemByVendor>({
      userId: auth.currUser.userInfo.userId,
      colKeys: byVendorColKeys,
      useChecker: d.useChecker ?? true,
      keyField: "vendorId",
    });

  const {
    columns,
    checkedKeys: checkedDetailKeys,
    mapper,
  } = useTable<OrderItemCombined>({
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
  const tableCol = computed((): DataTableColumns<OrderItemCombined> => {
    if (d.updateOrderCnt) {
      columns.value.forEach((x) => {
        if (x.key === "orderCnt") {
          x.title = "주문/미송";
          x.minWidth = "120";
          x.width = "120";
          x.render = (orderItem: OrderItemCombined) => {
            const order = d.orders.value.find(
              (o) => o.dbId === orderItem.orderDbId
            );

            return order
              ? h(ShopOrderCnt, {
                  order,
                  orderItem,
                  onSubmitPost: () => {
                    !orderItem.vendorProd.allowPending
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
    if (d.useState) {
      columns.value.push({
        key: "state",
        sorter: "default",
        title: "주문상태",
        render: (row) =>
          h(
            NText,
            {},
            { default: () => ORDER_STATE[row.state as ORDER_STATE] }
          ),
      });
    }

    return columns.value.length > 1
      ? (
          [
            columns.value[0],
            {
              key: "titleImgs",
              title: "이미지",
              render: (x) =>
                h(
                  NImage,
                  {
                    src: x.vendorProd?.titleImgs[0] ?? "/img/x.png",
                    width: "50",
                    height: "50",
                  },
                  {}
                ),
            },
            {
              key: "info",
              title: "상품정보",
              minWidth: "150",
              render: (x) =>
                h(
                  InfoCell,
                  {
                    first: x.shopProd.prodName,
                    second: x.vendorProd.vendorProdName,
                    third: x.shopProd.color + "/" + x.shopProd.size,
                  },
                  {}
                ),
            },

            ...columns.value.slice(1),
          ] as DataTableColumns<OrderItemCombined>
        ).map((col) => {
          if (!col.minWidth && !col.width) {
            col.minWidth = "100";
            return col;
          }
          return col;
        })
      : [];
  });
  const targetIds = computed(() => {
    const itemIds = new Set<string>(
      d.garmentOrders.value
        .filter(
          (x) =>
            checkedDetailKeys.value.includes(x.id) ||
            byVendorKeys.value.includes(x.vendorId)
        )
        .map((y) => y.id)
    );
    if (selectedData.value) {
      selectedData.value.items.forEach((z: any) => itemIds.add(z.id));
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
