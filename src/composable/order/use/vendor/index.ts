import { DataTableColumns } from "naive-ui";
import { OrderItemCombined } from "../../domain";

export * from "./approve";

export function getBasicColumns(
  showPaidDate: boolean
): DataTableColumns<OrderItemCombined> {
  const cols: DataTableColumns<OrderItemCombined> = [
    {
      type: "selection",
    },
    {
      title: "주문상품",
      key: "vendorProd.vendorProdName",
    },
    {
      title: "컬러",
      key: "vendorProd.color",
    },
    {
      title: "사이즈",
      key: "vendorProd.size",
    },
    {
      title: "재고개수",
      key: "vendorProd.stockCnt",
    },
    {
      title: "주문수량",
      key: "orderCnt",
    },
    {
      title: "미송개수",
      key: "pendingCnt",
    },
  ];
  if (showPaidDate) {
    cols.push({
      title: "결제일",
      key: "amount.paidAt",
    });
  }
  return cols;
}
