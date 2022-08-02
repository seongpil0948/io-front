import LogoChecker from "@/component/input/LogoChecker.vue";
import MapperSaver from "@/component/input/MapperSaver.vue";
import { NCheckbox, NGradientText, NButton } from "naive-ui";
import {
  TableBaseColumn,
  ColumnKey,
} from "naive-ui/es/data-table/src/interface";
import { onBeforeMount, ref, watchEffect, h } from "vue";
import { IoColOpt, MapperFields, IoColOptInner } from "./domain";
import { Mapper } from "./model";

export function useMapper(uid: string) {
  const mapper = ref<Mapper | null>(null);
  onBeforeMount(async () => {
    mapper.value = await Mapper.getIoMapper(uid);
  });
  return { mapper };
}

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
      const inner: IoColOptInner<T> = {
        key: opt.key,
        cellRender: opt.cellRender,
      };

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
  console.log("colKeys: ", colKeys);
  return colKeys.map((opt) => {
    if (!opt.key) throw Error("Column Key must not Null!!!!");
    const col: TableBaseColumn<T> = {
      key: opt.key as ColumnKey,
      title: opt.colRendor ?? colKoMapper[opt.key] ?? opt.key,
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
    } else if (col.key === "orderAmount") {
      // col.render = (row: any) => row.actualAmount.amount!.toLocaleString();
      col.title = "금액";
      // col.render = (row: any) => {
      //   // console.log(row);
      //   return row.actualAmount.orderAmount;
      // };
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

const colKoMapper: { [key in string]: string | null } = {
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
  shipFeeAmount: "배송비",
  shipFeeDiscountAmount: "배송할인액",
  tax: "세액",
  paidAmount: "지불된금액",
  paid: "지불여부",
  orderAmount: "주문요청금액",
  "actualAmount.orderAmount": "주문요청금액",
  paymentConfirm: "지불확인여부",
  paymentMethod: "지불방법",
  name: null,
  description: null,
  companyName: null,
  companyNo: null,
  companyCertificate: null,
  locations: null,
  emailTax: null,
  companyPhone: null,
  currentAccount: null,
  shopLink: null,
  ceoName: null,
  ceoPhone: null,
  managerName: null,
  managerPhone: null,
  createdAt: null,
  updatedAt: null,
  userId: null,
  providerId: null,
  displayName: null,
  email: null,
  emailVerified: null,
  profileImg: null,
  role: null,
  fcmTokens: null,
  passed: null,
  saleAverage: null,
  purchaseMethod: null,
  autoOrderApprove: null,
  saleManageType: null,
  taxDeadlineDay: null,
  expectNumProdMonthly: null,
  account: null,
  bankName: null,
  vendorId: null,
  vendorProdId: null,
  shopId: null,
  shopProdId: null,
  activeCnt: null,
  pureAmount: null,
  dbId: null,
  parent: null,
  actualAmount: null,
  initialAmount: null,
  shippingStatus: null,
  items: null,
  orderDate: null,
  subOrderIds: null,
  cancellations: "취소내역",
  ctgr: null,
  fabric: null,
  combineId: null,
  bodyImgs: null,
  info: null,
  id: null,
  doneDate: null,
  state: null,
  cancelDone: null,
  cancelInProcessing: null,
  reqCancel: null,
  doneCancel: null,
  reqOrder: null,
  doneOrder: null,
  dividePartial: null,
  sameOrder: null,
  gender: null,
  part: null,
  userInfo: null,
  companyInfo: null,
  operInfo: null,
  preferDark: null,
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
