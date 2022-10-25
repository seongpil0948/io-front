import { LocateAmount } from "@/composable";
import { useAuthStore } from "@/store";
import { DataTableColumns, NText, NButton, useMessage } from "naive-ui";
import { Ref, h } from "vue";

export function useShipUnitCols(
  showModal: Ref<boolean>,
  unitKey: "amountBySize" | "amountByWeight"
) {
  const auth = useAuthStore();
  const u = auth.currUser;
  const target = u.uncleInfo![unitKey];
  const shipUnitCols: DataTableColumns<{ unit: string; amount: number }> = [
    {
      title: "단위",
      key: "unit",
    },
    {
      title: "단위요금",
      key: "amount",
      render: (row) =>
        h(NText, { type: "info" }, { default: () => row.amount }),
    },
    {
      title: () =>
        h(
          NButton,
          {
            text: true,
            onClick: () => {
              showModal.value = true;
            },
          },
          { default: () => "추가" }
        ),
      key: "delete",
      render: (row) =>
        h(
          NButton,
          {
            type: "error",
            onClick: async () => {
              delete target[row.unit];
              await u.update();
            },
            size: "small",
          },
          { default: () => "삭제" }
        ),
    },
  ];
  return {
    shipUnitCols,
  };
}

export function useShipAreaCols() {
  const auth = useAuthStore();
  const u = auth.currUser;
  const msg = useMessage();
  const shipAreaCols: DataTableColumns<LocateAmount> = [
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
              const idx = u.uncleInfo!.shipLocates.findIndex(
                (e) =>
                  l.city === e.locate.city &&
                  l.county === e.locate.county &&
                  l.town === e.locate.town
              );
              console.log("idx:", idx);
              u.uncleInfo!.shipLocates.splice(idx, 1);
              await u.update();
              msg.success("삭제완료.");
            },
          },
          { default: () => "삭제" }
        ),
    },
  ];
  return { shipAreaCols };
}
