import { storeToRefs } from "pinia";
import {
  isSamePickLocate,
  LocateAmount,
  USER_DB,
  VendorGarment,
} from "@/composable";
import {
  OrderItemByShopUncle,
  OrderItemCombined,
  PopOrderDate,
} from "@/composable/order";
import { useAuthStore } from "@/store";
import { uniqueArr } from "@/util";
import {
  DataTableColumns,
  NText,
  NButton,
  useMessage,
  NPopover,
} from "naive-ui";
import { computed, h, defineAsyncComponent } from "vue";
import { ioFireStore } from "@/plugin/firebase";
import { PopVendorProdCard } from "@/component/card/vendor/render";

export function usePickAreaCols() {
  const auth = useAuthStore();
  const { user } = storeToRefs(auth);
  const msg = useMessage();
  const pickAreaCols: DataTableColumns<LocateAmount> = [
    {
      title: "도/시",
      key: "locate.city",
      sorter(rowA, rowB) {
        return rowA.locate.city!.length - rowB.locate.city!.length;
      },
    },
    {
      title: "군/구",
      key: "locate.county",
      sorter(rowA, rowB) {
        return rowA.locate.county!.length - rowB.locate.county!.length;
      },
    },
    {
      title: "읍/면/동",
      key: "locate.town",
      sorter: "default",
      filter: true,
    },
    {
      title: "건물명",
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
              if (!user.value) return;
              const l = row.locate;
              const idx = user.value.uncleInfo!.pickupLocates.findIndex((e) =>
                isSamePickLocate(l, e.locate)
              );
              user.value.uncleInfo!.pickupLocates.splice(idx, 1);
              await USER_DB.updateUser(ioFireStore, user.value);
              auth.setUser(user.value!);
              msg.success("삭제완료.");
            },
          },
          { default: () => "삭제" }
        ),
    },
  ];
  return { pickAreaCols };
}
const PayAmountsCard = defineAsyncComponent(
  () => import("@/component/card/PayAmountsCard.vue")
);
export function getPickReqCols(
  onClickDetail: (data: OrderItemByShopUncle) => void
) {
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
      {
        title: "결제 정보",
        key: "amounts",
        render: (row) =>
          h(
            NPopover,
            {
              overlap: true,
            },
            {
              trigger: () =>
                h(
                  NButton,
                  {
                    size: "small",
                  },
                  { default: () => "결제 정보" }
                ),
              default: () => h(PayAmountsCard, { amounts: row }),
            }
          ),
      },
    ] as DataTableColumns<OrderItemByShopUncle>;
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
    // {
    //   type: "selection",
    // },
    {
      title: "도매처명",
      key: "vendorName",
      render: (row) =>
        row.vendorProd.userInfo.displayName ?? row.vendorProd.userInfo.userName,
    },
    // {
    //   title: "도매처 주소",
    //   key: "vendor locate",
    //   render: (row) =>
    //     row.vendorProd.companyInfo &&
    //     row.vendorProd.companyInfo.shipLocate
    //       ? locateToStr(row.vendorProd.companyInfo.shipLocate)
    //       : null,
    // },
    {
      title: "상세 주소",
      key: "vendor locate",
      render: (row) =>
        row.orderType === "RETURN"
          ? row.shopProd.companyInfo && row.shopProd.companyInfo.shipLocate
            ? row.shopProd.companyInfo.shipLocate.detailLocate +
              " " +
              row.shopProd.companyInfo.shipLocate.alias
            : null
          : row.vendorProd.companyInfo && row.vendorProd.companyInfo.shipLocate
          ? row.vendorProd.companyInfo.shipLocate.detailLocate +
            " " +
            row.vendorProd.companyInfo.shipLocate.alias
          : null,
    },

    {
      title: "상품명",
      key: "vendorProd.vendorProdName",
      render: (row) =>
        h(PopVendorProdCard, {
          vendorProd: VendorGarment.fromJson(row.vendorProd)!,
        }),
    },
    {
      title: "일자정보",
      key: "orderDate",
      render: (row) => h(PopOrderDate, { od: row.od }),
    },
    {
      title: "픽업수량",
      key: "orderCnt",
    },
  ] as DataTableColumns<OrderItemCombined>;
  return cols.map((x: any) => {
    if (!["selection", "expand"].includes(x.type)) {
      x.sorter = "default";
    }
    return x;
  });
});
