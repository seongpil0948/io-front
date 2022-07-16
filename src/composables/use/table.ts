import MapperSaver from "@/components/input/MapperSaver.vue";
import type { IoColOpt, IoColOptInner, MapperFields } from "@/types";
import type {
  ColumnKey,
  TableBaseColumn,
} from "naive-ui/es/data-table/src/interface";
import { NButton, NCheckbox, NGradientText } from "naive-ui";
import { ref, watchEffect, h } from "vue";
import { useMapper } from "..";
import LogoChecker from "@/components/input/LogoChecker.vue";

interface useTableParam {
  userId: string;
  colKeys: IoColOpt[];
  useChecker?: boolean;
  keyField?: keyof MapperFields;
  onCheckAll?: (to: boolean) => void;
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
              "on-clickoutside": () => {
                openKey.value = "";
              },
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
              "on-clickoutside": () => {
                openKey.value = "";
              },
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
    columns.value.forEach((x) => (x.align = "center"));
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
      title: opt.colRendor ?? colKoMapper[opt.key],
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
    } else if (col.key === "amount") {
      col.render = (row: any) => row.amount!.toLocaleString();
    }
    if ((["userName", "prodName"] as any[]).includes(col.key)) {
      col.sorter = "default";
    }
    if (opt.cellRender) {
      col.render = opt.cellRender;
    }
    return col;
  });
}

const colKoMapper: { [key in keyof MapperFields]: string } = {
  vendorProdName: "도매처 상품명",
  userName: "거래처명",
  prodName: "상품명",
  vendorPrice: "도매가",
  prodPrice: "판매가",
  color: "컬러",
  size: "사이즈",
  stockCnt: "재고",
  orderCnt: "주문개수",
  orderId: "주문번호",
  allowPending: "자동미송",
  pendingCnt: "미송",
  titleImgs: "이미지",
  amount: "총결제금액",
  unPaidAmount: "미결제금액",
  amountPaid: "결제된금액",
};

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
