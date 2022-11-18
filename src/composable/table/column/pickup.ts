import { ProdOrderByShop, ProdOrderCombined } from "@/composable/order";
import { useAuthStore } from "@/store";
import { uniqueArr } from "@/util";
import { LocateAmount, USER_DB } from "@io-boxies/js-lib";
import { DataTableColumns, NText, NButton, useMessage } from "naive-ui";
import { computed, h } from "vue";

export function usePickAreaCols() {
  const auth = useAuthStore();
  const u = auth.currUser;
  const msg = useMessage();
  const pickAreaCols: DataTableColumns<LocateAmount> = [
    {
      title: "도",
      key: "locate.city",
      sorter(rowA, rowB) {
        return rowA.locate.city!.length - rowB.locate.city!.length;
      },
    },
    {
      title: "시",
      key: "locate.county",
      sorter(rowA, rowB) {
        return rowA.locate.county!.length - rowB.locate.county!.length;
      },
    },
    {
      title: "군/구",
      key: "locate.town",
      sorter: "default",
      filter: true,
    },
    {
      title: "건물",
      key: "locate.alias",
      sorter: "default",
      filter: true,
    },
    {
      title: "요금",
      key: "amount",
      render: (row) =>
        h(NText, { type: "info" }, { default: () => row.amount }),
    },
    {
      title: "삭제",
      key: "delete",
      render: (row) =>
        h(
          NButton,
          {
            type: "error",
            onClick: async () => {
              const l = row.locate;
              const idx = u.uncleInfo!.pickupLocates.findIndex(
                (e) => l.city === e.locate.city && l.alias === e.locate.alias
              );
              // console.log("idx: ", idx, l);
              u.uncleInfo!.pickupLocates.splice(idx, 1);
              await USER_DB.updateUser(u);
              msg.success("삭제완료.");
            },
          },
          { default: () => "삭제" }
        ),
    },
  ];
  return { pickAreaCols };
}

export function getPickReqCols(onClickDetail: (data: ProdOrderByShop) => void) {
  return computed(() => {
    const cols = [
      {
        type: "selection",
      },
      {
        title: "소매처명",
        key: "shopName",
      },
      {
        title: "도매수량",
        render: (row) =>
          h(
            "div",
            {},
            {
              default: () => uniqueArr(row.items.map((x) => x.vendorId)).length,
            }
          ),
      },

      {
        title: "픽업수량",
        key: "orderCnt",
        render: (row) =>
          row.items.reduce((acc, curr) => acc + curr.orderCnt, 0),
      },
      {
        title: "상세",
        key: "detail",
        render: (row) =>
          h(
            NButton,
            {
              onClick: () => onClickDetail(row),
              size: "small",
            },
            { default: () => "상세보기" }
          ),
      },
    ] as DataTableColumns<ProdOrderByShop>;
    return cols.map((x: any) => {
      if (!["selection", "expand"].includes(x.type)) {
        x.sorter = "default";
      }
      return x;
    });
  });
}

export const pickReqDetailCols = computed(() => {
  const cols = [
    {
      type: "selection",
    },
    {
      title: "도매처명",
      key: "vendorName",
      render: (row) =>
        row.vendorGarment.userInfo.displayName ??
        row.vendorGarment.userInfo.userName,
    },
    // {
    //   title: "도매처 주소",
    //   key: "vendor locate",
    //   render: (row) =>
    //     row.vendorGarment.companyInfo &&
    //     row.vendorGarment.companyInfo.shipLocate
    //       ? locateToStr(row.vendorGarment.companyInfo.shipLocate)
    //       : null,
    // },
    {
      title: "상세 주소",
      key: "vendor locate",
      render: (row) =>
        row.orderType === "RETURN"
          ? row.shopGarment.companyInfo &&
            row.shopGarment.companyInfo.shipLocate
            ? row.shopGarment.companyInfo.shipLocate.detailLocate
            : null
          : row.vendorGarment.companyInfo &&
            row.vendorGarment.companyInfo.shipLocate
          ? row.vendorGarment.companyInfo.shipLocate.detailLocate
          : null,
    },
    {
      title: "상품명",
      key: "vendorGarment.vendorProdName",
    },
    {
      title: "픽업수량",
      key: "orderCnt",
    },
  ] as DataTableColumns<ProdOrderCombined>;
  return cols.map((x: any) => {
    if (!["selection", "expand"].includes(x.type)) {
      x.sorter = "default";
    }
    return x;
  });
});
