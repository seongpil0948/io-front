import { ProdOrderCombined } from "@/composable/order";
import { NImage, NText, DataTableColumns } from "naive-ui";
import { computed, h } from "vue";
import InfoCell from "@/component/table/InfoCell.vue";
import CancelButton from "@/component/button/CancelButton.vue";
import { useVendorsStore } from "@/store";
import { timeToDate } from "@io-boxies/js-lib";
import { FilterOption } from "naive-ui/es/data-table/src/interface";

export function usePendingOrderCols() {
  const vendorStore = useVendorsStore();
  const filterOpts = computed<FilterOption[]>(() => {
    return vendorStore.vendors.map((z) => {
      const name = z.userInfo.displayName ?? "";
      return { label: name, value: name };
    });
  });
  const pendingOrderCols = computed(
    () =>
      [
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
          width: 200,
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
          sorter: (row1, row2) =>
            row1.shopGarment.prodName.localeCompare(row2.shopGarment.prodName),
        },
        {
          title: "도매이름",
          key: "vendorName",
          render: (x) => {
            const vendor = vendorStore.vendors.find(
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
          filterOptions: filterOpts.value,
          filter(value, row) {
            const vendor = vendorStore.vendors.find(
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
          key: "vendorGarment.vendorPrice",
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
                default: () => x.vendorGarment.vendorPrice * x.pendingCnt,
              }
            ),
        },
        {
          title: "결제완료일",
          key: "actualAmount.paidDate",
          render: (x) =>
            h(
              NText,
              {
                primary: true,
              },
              {
                default: () => timeToDate(x.actualAmount.paidDate, "MIN"),
              }
            ),
        },
        {
          key: "cancel",
          title: "취소접수",
          render: (prodOrder: ProdOrderCombined) =>
            h(
              CancelButton,
              {
                prodOrder,
              },
              { default: () => "취소요청" }
            ),
        },
      ] as DataTableColumns<ProdOrderCombined>
  );
  return { pendingOrderCols };
}
