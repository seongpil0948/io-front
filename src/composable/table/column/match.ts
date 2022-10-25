import { MatchGarment } from "@/composable/product";
import { NButton } from "naive-ui";
import { computed, h } from "vue";

export function getMatchCols(onClickId: (row: MatchGarment) => Promise<void>) {
  return computed(() => [
    {
      title: "서비스",
      key: "service",
      sorter: "default",
    },
    {
      title: "주문개수",
      key: "orderCnt",
    },
    {
      title: "ID",
      key: "ID",
      children: [
        {
          title: "매칭된ID",
          key: "id",
          render: (row: MatchGarment) =>
            h(
              NButton,
              {
                type: row.id ? "primary" : "error",
                text: row.id !== undefined,
                onClick: async () => await onClickId(row),
              },
              { default: () => row.id ?? "상품선택" }
            ),
        },
        {
          title: "외부ID",
          key: "inputId",
        },
      ],
    },
    {
      title: "상품명",
      key: "prodNameParent",
      children: [
        {
          title: "매칭된상품명",
          key: "prodName",
        },
        {
          title: "외부상품명",
          key: "inputProdName",
        },
      ],
    },
    {
      title: "입력옵션",
      key: "optionValue",
    },
    {
      title: "컬러",
      key: "color",
    },
    {
      title: "사이즈",
      key: "size",
    },
  ]);
}
