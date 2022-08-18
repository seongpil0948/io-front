import { GarmentOrder, IoColOpt, ProdOrderCombined } from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { DataTableColumns, NImage, useMessage } from "naive-ui";
import { computed, h, ref, Ref } from "vue";
import { useTable } from "./table";
import ShopOrderCnt from "@/component/input/ShopOrderCnt.vue";
import InfoCell from "@/component/table/InfoCell.vue";

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

interface orderTableParam {
  garmentOrders: Ref<ProdOrderCombined[]>;
  orders: Ref<GarmentOrder[]>;
  updateOrderCnt: boolean;
}
export function useOrderTable(d: orderTableParam) {
  const auth = useAuthStore();
  const msg = useMessage();

  const tableRef = ref<any>(null);
  const keyField = "id";
  const { columns, checkedKeys, mapper } = useTable<ProdOrderCombined>({
    userId: auth.currUser.userInfo.userId,
    colKeys,
    useChecker: true,
    keyField,
    onCheckAll: (to) => {
      if (tableRef.value) {
        const idxes = (tableRef.value.paginatedData as any[]).map(
          (x) => x.index
        );
        checkedKeys.value = to
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
            const order = d.orders.value.find((x) => {
              return x.getProdOrders(prodOrder.id)![0];
            });
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
            width: 400,
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

  return { tableRef, columns, checkedKeys, tableCol, mapper };
}
