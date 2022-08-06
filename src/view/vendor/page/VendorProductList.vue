<script setup lang="ts">
import {
  useTable,
  IoColOpt,
  VendorUserOrderGarment,
  useReadVendorOrderGInfo,
  VendorGarment,
} from "@/composable/";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { useMessage, NButton } from "naive-ui";
import { computed, watchEffect, h, ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import LogoChecker from "@/component/input/LogoChecker.vue";

const log = useLogger();
const auth = useAuthStore();
const msg = useMessage();
// const { orderProds } = useReadVendorOrderInfo({
//   vendorId: auth.currUser.userInfo.userId,
//   inStates: [],
//   notStates: [ORDER_STATE.BEFORE_ORDER, ORDER_STATE.BEFORE_APPROVE],
// });
const { orders, garmentOrders, garmentOrdersByShop } = useReadVendorOrderGInfo(
  auth.currUser.userInfo.userId,
  [],
  []
);
const tableData = computed(() =>
  garmentOrders.value.reduce((acc, p) => {
    const exist = acc.find((x) => x.vendorProdId === p.vendorProdId);
    if (exist) {
      exist.orderAmount += p.actualAmount.orderAmount;
      exist.orderCnt += p.orderCnt;
      exist.activeCnt += p.activeCnt;
      exist.pendingCnt += p.pendingCnt;
    } else {
      acc.push(Object.assign(p, p.actualAmount, p.vendorGarment));
    }
    return acc;
  }, [] as VendorUserOrderGarment[])
);
const { columns } = useTable<Omit<VendorUserOrderGarment, "account">>({
  userId: auth.currUser.userInfo.userId,
  colKeys: [
    "vendorProdName",
    "size",
    "color",
    "orderCnt",
    "pendingCnt",
    "stockCnt",
    "vendorPrice",
    "amount",
  ].map((x) => {
    return { key: x } as IoColOpt;
  }),
});
watchEffect(() => {
  columns.value.push(
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
                msg.success("미송정보 수정에 성공하였습니다.", makeMsgOpt());
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
        title: () =>
          h(
            NButton,
            {
              round: true,
              onClick: () => {
                log.debug("Clicked 변경사항 수정 Title");
              },
            },
            { default: () => "변경사항 수정" }
          ),
        key: "edit",
        render: (row: VendorUserOrderGarment) =>
          h(
            NButton,
            {
              round: true,
              onClick: () => onShowProdEdit(VendorGarment.fromJson(row)),
            },
            { default: () => "상품수정" }
          ),
      },
    ]
  );
});
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
</script>
<template>
  <n-card style="width: 80%">
    <template #header> 상품목록 </template>
    <n-data-table
      :scroll-x="1200"
      :columns="columns"
      :data="tableData"
      :pagination="{
        'show-size-picker': true,
        'page-sizes': [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <n-modal
    v-model:show="showProdEdit"
    preset="card"
    style="width: 70%"
    title="상품 정보 수정"
  >
    <!-- <vendor-prod-edit-form
      v-if="showProdEdit && prodEditTarget"
      :prod="prodEditTarget"
      @onSubmitProd="onShowProdEdit(null)"
    /> -->
  </n-modal>
</template>
