import {
  useTable,
  IoColOpt,
  VendorUserOrderGarment,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable/";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { NButton, useMessage } from "naive-ui";
import { computed, h, ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import LogoChecker from "@/component/input/checker/LogoChecker.vue";

export function useVendorProdCols(editOrder = true, editProd = false) {
  const logger = useLogger();
  const auth = useAuthStore();
  const msg = useMessage();

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

  const colKeys = [
    "vendorProdName",
    "size",
    "color",
    "stockCnt",
    "vendorPrice",
  ].map((x) => {
    return { key: x } as IoColOpt;
  });
  if (editOrder) {
    colKeys.unshift({ imgField: true, key: "titleImgs" });
    colKeys.push(
      ...[
        "createdAt",
        "updatedAt",
        "orderCnt",
        "pendingCnt",
        "actualAmount.orderAmount",
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
      ] as typeof basicCols.value;
    } else {
      return basicCols.value;
    }
  });

  return {
    columns,
    showProdEdit,
    prodEditTarget,
    onShowProdEdit,
  };
}
