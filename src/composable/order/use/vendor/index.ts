import { DataTableColumns } from "naive-ui";
import { ProdOrderCombined } from "../../domain";

export * from "./approve";

export function getBasicColumns(
  showPaidDate: boolean
): DataTableColumns<ProdOrderCombined> {
  const cols: DataTableColumns<ProdOrderCombined> = [
    {
      type: "selection",
    },
    {
      title: "주문상품",
      key: "vendorGarment.vendorProdName",
    },
    {
      title: "컬러",
      key: "vendorGarment.color",
    },
    {
      title: "사이즈",
      key: "vendorGarment.size",
    },
    {
      title: "재고개수",
      key: "vendorGarment.stockCnt",
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
      key: "actualAmount.paidDate",
    });
  }
  return cols;
}
