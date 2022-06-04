import MapperSaver from "@/components/input/MapperSaver.vue";
import type { IoColOpt, IoColOptInner, MapperFields } from "@/types";
import type {
  ColumnKey,
  TableBaseColumn,
} from "naive-ui/es/data-table/src/interface";
import { NCheckbox } from "naive-ui";
import { ref, watchEffect, h } from "vue";
import { useMapper } from "..";
import LogoChecker from "@/components/input/LogoChecker.vue";

interface useTableParam {
  userId: string;
  colKeys: IoColOpt[];
  useChecker?: boolean;
  keyField?: keyof MapperFields;
}
export function useTable<T extends MapperFields>(p: useTableParam) {
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
      const inner: IoColOptInner<T> = { key: opt.key };

      if (opt.titleMapping) {
        inner.colRendor = () =>
          h(
            MapperSaver,
            {
              show: openKey.value === opt.key,
              value: colKoMapper[opt.key] ?? opt.key,
              mapper,
              mapType: "column",
              mapKey: opt.key,
              onReqShow: onRequestShow,
            },
            {}
          );
      }

      if (opt.cellMapping && opt.rowIdField) {
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
              mapKey: opt.key,
              rowIdField: row[opt.rowIdField!],
              targetVal: row[opt.key],
              onReqShow: onRequestShow,
            },
            {}
          );
      }
      return inner;
    });
    columns.value.forEach((x) => (x.align = "center"));
    columns.value = makeTableCols(innerOpts);
    if (p.useChecker && p.keyField) {
      columns.value.unshift({
        key: "checker",
        title: () => h(NCheckbox, { disabled: true }),
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
  });

  return { columns, mapper, onRequestShow, openKey };
}

function makeTableCols<T>(colKeys: IoColOptInner<T>[]): TableBaseColumn<T>[] {
  return colKeys.map((opt) => {
    if (!opt.key) throw Error("Column Key must not Nullllll!!!!");
    const col: TableBaseColumn<T> = {
      key: opt.key as ColumnKey,
      title: opt.colRendor ?? colKoMapper[opt.key],
    };
    if (opt.cellRender) {
      col.render = opt.cellRender;
    }
    return col;
  });
}

const colKoMapper: { [key in keyof MapperFields]: string } = {
  vendorProdName: "도매처 상품명",
  userName: "도매처명",
  prodName: "상품명",
  vendorPrice: "도매가",
  prodPrice: "판매가",
  color: "컬러",
  size: "사이즈",
  stockCnt: "도매처현재고",
  amount: "결제금액",
  orderCnt: "주문개수",
  orderId: "주문번호",
};
