import { MatchGarment } from "@/composable/product";
import { NButton } from "naive-ui";
import { computed, h } from "vue";

export function getMatchCols(onClickId: (row: MatchGarment) => Promise<void>) {
  return computed(() => [
    {
      title: "매칭",
      key: "id",
      render: (row: MatchGarment) =>
        h(
          NButton,
          {
            type: row.id ? "info" : "error",
            size: "small",
            style: {
              color: "white",
            },
            onClick: async () => await onClickId(row),
          },
          { default: () => (row.id ? "매칭수정" : "상품선택") }
        ),
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
      title: "서비스",
      key: "service",
      sorter: "default",
    },
    {
      title: "주문개수",
      key: "orderCnt",
    },
    {
      title: "주문번호",
      key: "orderId",
    },
    {
      title: "입력컬러",
      key: "inputColor",
    },
    {
      title: "컬러",
      key: "color",
    },
    {
      title: "입력사이즈",
      key: "inputSize",
    },
    {
      title: "사이즈",
      key: "size",
    },
  ]);
}
