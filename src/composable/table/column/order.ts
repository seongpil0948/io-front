import { OrderItemCombined } from "@/composable/order";
import { NImage, NText, DataTableColumns } from "naive-ui";
import { h, defineAsyncComponent } from "vue";
import InfoCell from "@/component/table/InfoCell.vue";

import { IoUser, timeToDate } from "@io-boxies/js-lib";

const CancelButton = defineAsyncComponent(
  () => import("@/component/button/CancelButton.vue")
);
export function usePendingOrderCols() {
  const filterOpts = (targetVendors: IoUser[]) =>
    targetVendors.map((z) => {
      const name = z.userInfo.displayName ?? "";
      return { label: name, value: name };
    });

  const pendingOrderCols = (targetVendors: IoUser[]) =>
    [
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
        width: 200,
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
        sorter: (row1, row2) =>
          row1.shopProd.prodName.localeCompare(row2.shopProd.prodName),
      },
      {
        title: "도매이름",
        key: "vendorName",
        render: (x) => {
          const vendor = targetVendors.find(
            (y) => y.userInfo.userId === x.vendorId
          );
          return h(
            NText,
            {
              primary: true,
            },
            { default: () => vendor?.userInfo.displayName }
          );
        },
        filterOptions: filterOpts(targetVendors),
        filter(value, row) {
          const vendor = targetVendors.find(
            (y) => y.userInfo.userId === row.vendorId
          );
          return (vendor?.userInfo.displayName ?? "") == (value as string);
        },
      },
      {
        title: "총 주문수량",
        key: "orderCnt",
      },
      {
        title: "미송수량",
        key: "pendingCnt",
      },
      {
        title: "판매금액",
        key: "vendorProd.vendorPrice",
      },
      {
        title: "합계",
        key: "amount",
        render: (x) =>
          h(
            NText,
            {
              primary: true,
            },
            {
              default: () => x.vendorProd.vendorPrice * x.pendingCnt,
            }
          ),
      },
      {
        title: "결제완료일",
        key: "amount.paidAt",
        render: (x) =>
          h(
            NText,
            {
              primary: true,
            },
            {
              default: () => timeToDate(x.amount.paidAt, "MIN"),
            }
          ),
      },
      {
        key: "cancel",
        title: "취소접수",
        render: (orderItem: OrderItemCombined) =>
          h(
            CancelButton,
            {
              orderItem,
            },
            { default: () => "취소요청" }
          ),
      },
    ] as DataTableColumns<OrderItemCombined>;
  return { pendingOrderCols, filterOpts };
}
