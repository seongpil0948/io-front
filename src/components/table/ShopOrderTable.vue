<script setup lang="ts">
import { useShopReadOrderInfo, useTable } from "@/composables";
import { useAuthStore } from "@/stores";
import { ORDER_STATE, IoColOpt, ShopOrderCombined } from "@/types";
import { NButton, NPopover, NText, useMessage } from "naive-ui";
import { computed, h } from "vue";

interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
}
const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "clickOrder", value: typeof orderJoined.value): void;
}>();
const msg = useMessage();
const user = useAuthStore().currUser;
const { orderJoined } = useShopReadOrderInfo({
  shopId: user.userInfo.userId,
  inStates: props.inStates ?? [],
  notStates: props.notStates ?? [],
});

const vendorCombined = computed(() => {
  const result: ShopOrderCombined[] = [];
  orderJoined.value.forEach((o) => {
    const exist = result.find((r) => r.vendorId === o.vendorId);
    if (exist) {
      exist.cnt += 1;
      exist.amount += o.amount!;
      if (!exist.orderStates.includes(o.orderState!)) {
        exist.orderStates.push(o.orderState!);
      }
      exist.amounts.push(o.amount);
      exist.pendingCnts.push(o.pendingCnt);
      exist.unPaidAmounts.push(o.amountPaid);
      exist.vendorProdIds.push(o.vendorProdId);
    } else {
      result.push(
        Object.assign(
          {
            cnt: 1,
            orderStates: [o.orderState!],
            amounts: [o.amount],
            pendingCnts: [o.pendingCnt],
            unPaidAmounts: [o.unPaidAmount!],
            vendorProdIds: [o.vendorProdId],
          },
          o
        )
      );
    }
  });
  return result;
});

const cols = ["userName", "amount"].map((c) => {
  return { key: c } as IoColOpt;
});
const keyField = "vendorId";
const { columns, checkedKeys, rendorTableBtn } = useTable<ShopOrderCombined>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField,
  onCheckAll: (to) =>
    (checkedKeys.value = to
      ? vendorCombined.value.map((p) => p[keyField])
      : []),
});
const refinedCols = computed(() => {
  const orderedCol: typeof columns.value[0] = {
    key: "ordered",
    title: "주문 내역",
    render: (row: ShopOrderCombined) =>
      h(
        NButton,
        {
          onClick: () =>
            emits(
              "clickOrder",
              orderJoined.value.filter((o) => o.vendorId === row.vendorId)
            ),
        },
        { default: () => `${row.cnt} 건 ∇` }
      ),
  };
  const stateCol: typeof columns.value[0] = {
    key: "states",
    title: "주문상태",
    render: (row) =>
      h(
        NText,
        {},
        {
          default: () =>
            row.orderStates.some((x) => x === ORDER_STATE.BEFORE_APPROVE)
              ? "미승인"
              : "승인",
        }
      ),
  };
  const isPaidCol: typeof columns.value[0] = {
    key: "isPaid",
    title: "결제여부",
    render: (row) =>
      h(
        NText,
        {},
        {
          default: () => (row.unPaidAmounts.some((x) => x > 0) ? "O" : "X"),
        }
      ),
  };
  const pendingCol: typeof columns.value[0] = {
    key: "isPending",
    title: "미송여부",
    render: (row) =>
      h(
        NText,
        {},
        {
          default: () => (row.pendingCnts.some((x) => x > 0) ? "O" : "X"),
        }
      ),
  };
  const accountCol: typeof columns.value[0] = {
    key: "accountInfo",
    title: "계좌확인",
    render: (row) =>
      h(
        NPopover,
        {
          placement: "bottom",
        },
        {
          trigger: () =>
            rendorTableBtn(() => {
              if (row.account) {
                navigator.clipboard.writeText(
                  row.account.bankName + " " + row.account.account
                );
                msg.info("계좌정보가 클립보드에 복사 되었습니다.");
              }
            }, row.account?.bankName ?? ""),
          default: () => `${row.account?.account}  ${row.account?.name}`,
        }
      ),
  };
  const cols = [...columns.value];
  const keys = columns.value.map((x) => x.key);
  if (!keys.includes(orderedCol.key)) {
    cols.push(orderedCol);
  }
  if (!keys.includes(stateCol.key)) {
    cols.push(stateCol);
  }
  if (!keys.includes(isPaidCol.key)) {
    cols.push(isPaidCol);
  }
  if (!keys.includes(pendingCol.key)) {
    cols.push(pendingCol);
  }
  if (!keys.includes(accountCol.key)) {
    cols.push(accountCol);
  }
  return cols;
});
</script>

<template>
  <n-card style="width: 80%">
    <n-data-table
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="refinedCols"
      :data="vendorCombined"
      :pagination="{
        pageSize: 10,
      }"
      :bordered="false"
    />
  </n-card>
</template>

<style scoped></style>
