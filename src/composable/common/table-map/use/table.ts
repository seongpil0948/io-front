import { NCheckbox, NGradientText, NButton, NText } from "naive-ui";
import {
  TableBaseColumn,
  ColumnKey,
} from "naive-ui/es/data-table/src/interface";
import { ref, watchEffect, h, Ref, defineAsyncComponent } from "vue";
import { IoColOpt, MapperFields, IoColOptInner } from "../domain";
import { colKoMapper } from "./colDict";
import { useMapper } from "./mapper";
import { formatDate, loadDate } from "@io-boxies/js-lib";

const MapperSaver = defineAsyncComponent(
  () => import("@/component/input/MapperSaver.vue")
);
const LogoChecker = defineAsyncComponent(
  () => import("@/component/input/checker/LogoChecker.vue")
);

interface useTableParam {
  userId: string;
  colKeys: IoColOpt[];
  useChecker?: boolean;
  keyField?: keyof MapperFields;
  onCheckAll?: (to: boolean) => void;
  data?: Ref<any[]>;
  siblingFields?: string[];
}
export function useTable<T extends MapperFields>(
  p: useTableParam,
  onSelect?: (g: T) => Promise<void>
) {
  const { mapper } = useMapper(p.userId);
  const columns = ref<TableBaseColumn<T>[]>([]);
  const openKey = ref("");
  const checkedKeys = ref<string[]>([]);
  function onRequestShow(val: string) {
    openKey.value = val;
  }
  watchEffect(() => {
    if (!mapper.value) return;
    const innerOpts = p.colKeys.map((opt) => {
      const inner: IoColOptInner<T> = {
        key: opt.key,
        cellRender: opt.cellRender,
        colRender: opt.colRender,
      };

      if (opt.titleMapping) {
        inner.colRender = () =>
          h(
            MapperSaver,
            {
              show: openKey.value === opt.key,
              value: colKoMapper[opt.key] ?? opt.key,
              mapper,
              mapType: "column",
              mapKey: opt.key,
              onReqShow: onRequestShow,
              "on-clickoutside": () => {
                openKey.value = "";
              },
            },
            {}
          );
      }

      if (opt.cellMapping && opt.rowIdField) {
        if (!p.data || !p.siblingFields)
          throw new Error("data and siblingFields is required");
        inner.cellRender = (row: T) =>
          h(
            MapperSaver,
            {
              show:
                openKey.value ===
                opt.key + (row[opt.rowIdField!] ?? "") + (row[opt.key] ?? ""),
              value: row[opt.key],
              mapper,
              mapType: "cell",
              mapKey: opt.key, // column name
              rowIdField: row[opt.rowIdField!], // prodId
              targetVal: row[opt.key], // original Value
              onReqShow: onRequestShow,
              "on-clickoutside": () => {
                openKey.value = "";
              },
              siblings: p
                .data!.value.filter((d) =>
                  p.siblingFields!.every(
                    (field) => row[field as keyof MapperFields] === d[field]
                  )
                )
                .map((r) => r[opt.rowIdField!]) as string[],
            },
            {}
          );
      } else if (opt.imgField) {
        inner.cellRender = (row: T) => {
          let src = null;
          if (
            Array.isArray(row[opt.key]) &&
            (row[opt.key] as string[]).length > 0
          ) {
            src = (row[opt.key] as string[])[0];
          } else if (typeof row[opt.key] === "string") {
            src = row[opt.key];
          }
          return h(
            "img",
            {
              src,
              width: "50",
              height: "50",
            },
            {}
          );
        };
      }
      return inner;
    });
    columns.value.forEach((x) => {
      x.align = "center";
      if (!x.width) {
        x.width = 150;
      }
    });
    columns.value = makeTableCols(innerOpts);
    if (p.useChecker && p.keyField) {
      columns.value.unshift({
        key: "checker",
        title: () =>
          h(NCheckbox, {
            onUpdateChecked: (to: boolean) => {
              if (p.onCheckAll) {
                p.onCheckAll(to);
              }
            },
          }),
        align: "left",
        width: 50,
        render: (row) =>
          h(LogoChecker, {
            size: 1,
            checked: checkedKeys.value.includes(row[p.keyField!]!.toString()),
            onClick: () => {
              const val = row[p.keyField!]!.toString();
              if (checkedKeys.value.includes(val)) {
                checkedKeys.value.splice(checkedKeys.value.indexOf(val), 1);
              } else {
                checkedKeys.value.push(val);
              }
            },
          }),
      });
    }
    if (onSelect) {
      columns.value.push({
        title: "선택",
        key: "select",
        render: (row) =>
          h(
            NButton,
            {
              onClick: () => onSelect(row),
            },
            { default: () => "선택" }
          ),
      });
    }
  });

  return {
    columns,
    mapper,
    onRequestShow,
    openKey,
    checkedKeys,
    colKoMapper,
    rendorTableBtn,
  };
}

function makeTableCols<T>(colKeys: IoColOptInner<T>[]): TableBaseColumn<T>[] {
  return colKeys.map((opt) => {
    if (!opt.key) throw Error("Column Key must not Null!!!!");
    const col: TableBaseColumn<T> = {
      key: opt.key as ColumnKey,
      title: opt.colRender ?? colKoMapper[opt.key] ?? opt.key,
    };
    if (opt.key === "allowPending") {
      col.filterOptions = [
        {
          label: "미송불가",
          value: "false",
        },
        {
          label: "미송가능",
          value: "true",
        },
      ];
      col.render = (row: any) =>
        h(
          NGradientText,
          {
            type: row.allowPending ? "info" : "error",
          },
          { default: () => (row.allowPending ? "가능" : "불가능") }
        );
      col.filter = (value, row: any) => row.allowPending.toString() === value;
    }
    if (
      (
        [
          "vendorGarment.userInfo.displayName",
          "userName",
          "shopGarment.prodName",
          "prodName",
        ] as any[]
      ).includes(col.key)
    ) {
      col.sorter = "default";
    } else if ((["createdAt", "updatedAt"] as any[]).includes(col.key)) {
      col.width = 200;
      col.sorter = "default";
      col.render = (row: any) =>
        h(
          NText,
          {},
          {
            default: () => {
              return formatDate(loadDate(row[col.key]), "MIN");
            },
          }
        );
    }
    if (opt.cellRender) {
      col.render = opt.cellRender;
    } else if (!col.render) {
      col.render = (row: any) =>
        h(
          NText,
          {},
          {
            default: () =>
              typeof row[col.key] === "number" || checkDigitStr(row[col.key])
                ? parseInt(row[col.key]).toLocaleString()
                : row[col.key],
          }
        );
    }
    return col;
  });
}
const checkDigitStr = (val: any) => /^\d+$/.test(val);
function rendorTableBtn(onClick: () => void, txt: string) {
  return h(
    NButton,
    {
      round: true,
      size: "small",
      onClick,
    },
    {
      default: () => txt,
    }
  );
}
