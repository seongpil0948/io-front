import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store";
import { LocateAmount } from "@io-boxies/js-lib";
import { DataTableColumns, NText, NButton, useMessage } from "naive-ui";
import { Ref, h } from "vue";
import { ioFireStore } from "@/plugin/firebase";
import { IoUser, USER_DB } from "@/composable";

export function useShipUnitCols(
  showModal: Ref<boolean>,
  unitKey: "amountBySize" | "amountByWeight",
  edit = true,
  u: IoUser
) {
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
        h(
          NText,
          { type: "info" },
          { default: () => row.amount.toLocaleString() }
        ),
    },
  ];
  if (edit) {
    shipUnitCols.push({
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
              await USER_DB.updateUser(ioFireStore, u);
            },
            size: "small",
          },
          { default: () => "삭제" }
        ),
    });
  }
  return {
    shipUnitCols,
  };
}

export function useShipAreaCols() {
  const auth = useAuthStore();
  const { user: u } = storeToRefs(auth);
  const msg = useMessage();
  const shipAreaCols: DataTableColumns<LocateAmount> = [
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
              const idx = u.value?.uncleInfo!.shipLocates.findIndex(
                (e) =>
                  l.city === e.locate.city &&
                  l.county === e.locate.county &&
                  l.town === e.locate.town
              );
              u.value?.uncleInfo!.shipLocates.splice(idx ?? -1, 1);
              await USER_DB.updateUser(ioFireStore, u.value!);
              auth.setUser(u.value!);
              msg.success("삭제완료.");
            },
          },
          { default: () => "삭제" }
        ),
    },
  ];
  return { shipAreaCols };
}
