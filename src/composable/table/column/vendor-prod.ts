import { partOpts } from "./../../../util/option/input";
import {
  useTable,
  IoColOpt,
  VendorUserOrderGarment,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable/";
import { useAuthStore, useCommonStore } from "@/store";
import { makeMsgOpt, getSizeOpts, getCtgrOpts } from "@/util";
import { NButton, NInput, NInputNumber, NSelect, useMessage } from "naive-ui";
import { computed, h, ref, defineAsyncComponent } from "vue";
import { useLogger } from "vue-logger-plugin";
import { storeToRefs } from "pinia";

const LogoChecker = defineAsyncComponent(
  () => import("@/component/input/checker/LogoChecker.vue")
);
export function useVendorProdCols(editOrder = true, editProd = false) {
  const logger = useLogger();
  const auth = useAuthStore();
  const msg = useMessage();
  const cs = useCommonStore();
  const { locale } = storeToRefs(cs);
  const showProdEdit = ref(false);
  const prodEditTarget = ref<VendorGarment | null>(null);
  function onShowProdEdit(row: VendorGarment | null) {
    if (!row) {
      showProdEdit.value = false;
      prodEditTarget.value = null;
    } else {
      showProdEdit.value = true;
      prodEditTarget.value = row;
    }
  }
  const colKeys: IoColOpt[] = [];
  if (editProd) {
    colKeys.push(
      // vendorProdName
      ...([
        {
          key: "vendorProdName",
          cellRender: (row: VendorGarment) =>
            h(NInput, {
              value: row.vendorProdName,
              onUpdateValue: (val) => {
                row.vendorProdName = val;
              },
            }),
        },
        {
          key: "part",
          cellRender: (row: VendorGarment) =>
            h(NSelect, {
              options: partOpts(locale.value),
              value: row.part,
              onUpdateValue: (val) => {
                row.part = val;
              },
            }),
        },
        {
          key: "ctgr",
          cellRender: (row: VendorGarment) =>
            h(NSelect, {
              options: getCtgrOpts(row.part, locale.value),
              value: row.ctgr,
              onUpdateValue: (val) => {
                row.ctgr = val;
              },
            }),
        },
        {
          key: "size",
          cellRender: (row: VendorGarment) =>
            h(NSelect, {
              options: getSizeOpts(row.part),
              value: row.size,
              onUpdateValue: (val) => {
                row.size = val;
              },
            }),
        },
        {
          key: "color",
          cellRender: (row: VendorGarment) =>
            h(NInput, {
              value: row.color,
              onUpdateValue: (val) => {
                row.color = val;
              },
            }),
        },
        {
          key: "stockCnt",
          cellRender: (row: VendorGarment) =>
            h(NInputNumber, {
              value: row.stockCnt,
              validator: (x) => x % 1 === 0,
              min: 1,
              onUpdateValue: (val) => {
                if (val) {
                  row.stockCnt = val;
                }
              },
            }),
        },
        {
          key: "vendorPrice",
          cellRender: (row: VendorGarment) =>
            h(NInputNumber, {
              value: row.vendorPrice,
              validator: (x) => x % 1 === 0,
              min: 100,
              step: 100,
              onUpdateValue: (val) => {
                if (val) {
                  row.vendorPrice = val;
                }
              },
            }),
        },
      ] as IoColOpt[])
    );
  } else {
    colKeys.push(
      ...([
        { key: "vendorProdName" },
        { key: "size" },
        { key: "color" },
        { key: "stockCnt" },
        { key: "vendorPrice" },
      ] as IoColOpt[])
    );
  }

  if (editOrder) {
    colKeys.unshift({ imgField: true, key: "titleImgs" });
    colKeys.push(
      ...[
        "createdAt",
        "updatedAt",
        "orderCnt",
        "pendingCnt",
        "amount.orderAmount",
      ].map((x) => {
        return { key: x } as IoColOpt;
      })
    );
  }
  const { columns: basicCols } = useTable<
    Omit<VendorUserOrderGarment, "account">
  >({
    userId: auth.currUser.userInfo.userId,
    colKeys,
  });
  const columns = computed(() => {
    if (editOrder) {
      return [
        ...basicCols.value,
        ...[
          {
            title: "미송설정",
            key: "allowPending",
            render: (row: VendorUserOrderGarment) =>
              h(LogoChecker, {
                checked: row.allowPending,
                size: 1.5,
                onClick: async () => {
                  if (
                    (!row.allowPending === false && row.pendingCnt === 0) ||
                    !row.allowPending === true
                  ) {
                    row.allowPending = !row.allowPending;
                    await VendorGarment.fromJson(row)!.update();
                    msg.success(
                      "미송정보 수정에 성공하였습니다.",
                      makeMsgOpt()
                    );
                  } else {
                    msg.error(
                      "미송 비활성화를 위해서는 미송 개수가 0이어야합니다.",
                      makeMsgOpt()
                    );
                  }
                },
              }),
          },
          {
            title: "수정",
            key: "editOrder",
            render: (row: VendorUserOrderGarment) =>
              h(
                NButton,
                {
                  round: true,
                  onClick: () => {
                    onShowProdEdit(VendorGarment.fromJson(row));
                  },
                },
                { default: () => "수정" }
              ),
          },
          {
            title: "삭제",
            key: "delete",
            render: (row: VendorUserOrderGarment) =>
              h(
                NButton,
                {
                  round: true,
                  onClick: () => {
                    VENDOR_GARMENT_DB.delete(row.vendorProdId)
                      .then(() => msg.success("삭제성공.", makeMsgOpt()))
                      .catch((err) => {
                        const message = `삭제실패. ${
                          err instanceof Error
                            ? err.message
                            : JSON.stringify(err)
                        }`;
                        msg.error(message, makeMsgOpt());
                        logger.error(auth.currUser.userInfo.userId, message);
                      });
                  },
                },
                { default: () => "삭제" }
              ),
          },
        ],
      ].map((x) => {
        x.minWidth = "100px";
        return x;
      }) as typeof basicCols.value;
    } else {
      return basicCols.value.map((x) => {
        x.minWidth = "100px";
        return x;
      });
    }
  });

  return {
    columns,
    showProdEdit,
    prodEditTarget,
    onShowProdEdit,
  };
}
