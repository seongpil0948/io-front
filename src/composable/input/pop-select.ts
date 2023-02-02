import { NPopselect, NButton } from "naive-ui";
import { shallowRef, watchEffect, h } from "vue";

export function usePopSelTable<T>(d: {
  onDelete?: (p: T) => Promise<void>;
  onEdit?: (p: T) => void;
}) {
  const selectedRow = shallowRef<T | null>(null);
  const popVal = shallowRef("");

  watchEffect(async () => {
    if (selectedRow.value === null) return;
    else if (d.onDelete && popVal.value === "Delete") {
      await d.onDelete(selectedRow.value);
    } else if (d.onEdit && popVal.value === "Edit") {
      d.onEdit(selectedRow.value);
    }
    popVal.value = "";
  });

  const optionCol = {
    title: "옵션",
    key: "option",
    render: (row: T) =>
      h(
        NPopselect,
        {
          value: popVal.value,
          onUpdateValue: (val: string) => {
            popVal.value = val;
            selectedRow.value = row;
          },
          options: [
            {
              label: "수정",
              value: "Edit",
            },
            {
              label: "삭제",
              value: "Delete",
            },
          ],
          scrollable: true,
          // "render-label": (opt: SelectBaseOption) =>
          //   h(NButton, {}, { default: () => opt.label }),
        },
        {
          default: () =>
            h(
              NButton,
              {
                strong: true,
                size: "small",
              },
              { default: () => "선택" }
            ),
        }
      ),
  };

  return {
    selectedRow,
    popVal,
    optionCol,
  };
}
