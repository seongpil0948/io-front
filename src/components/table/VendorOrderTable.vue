<script setup lang="ts">
import {
  useReadVendorOrderInfo,
  useTable,
  getScreenSize,
  ScreenSize,
  orderStateKo,
  VendorProd,
  makeMsgOpt,
} from "@/composables";
import { updateOrderBatch, vendorProdsModify } from "@/plugins/firebase";
import { useAuthStore } from "@/stores/auth";
import { IoColOpt, ORDER_STATE, VendorUserOrderProd } from "@/types";
import { useMessage } from "naive-ui";
import { computed, nextTick, ref, toRefs, watchEffect } from "vue";
import { useLogger } from "vue-logger-plugin";

const auth = useAuthStore();
const user = auth.currUser;
const msg = useMessage();
const log = useLogger();
interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
  showState?: boolean;
}
const props = defineProps<Props>();
const { inStates, notStates } = toRefs(props);
const { orderProds } = useReadVendorOrderInfo({
  vendorId: user.userInfo.userId,
  inStates: inStates?.value,
  notStates: notStates?.value,
});
const tableData = computed(() =>
  orderProds.value.filter((x) => x.dbId.length > 3)
);
const cols = [
  "userName",
  "vendorProdName",
  "color",
  "size",
  "orderCnt",
  "pendingCnt",
  "stockCnt",
  "amount",
].map((c) => {
  return { key: c } as IoColOpt;
});
const keyField = "shopProdId";
const tableRef = ref<any>(null);
const { columns, checkedKeys } = useTable<VendorUserOrderProd>({
  userId: user.userInfo.userId,
  colKeys: cols,
  useChecker: true,
  keyField,
  onCheckAll: (to) => {
    if (tableRef.value) {
      const idxes = (tableRef.value.paginatedData as any[]).map((x) => x.index);
      checkedKeys.value = to
        ? tableData.value
            .filter((o, idx) => idxes.includes(idx))
            .map((p) => p[keyField])
        : [];
    }
  },
});
watchEffect(() => {
  if (props.showState && !columns.value.some((x) => x.key === "state")) {
    columns.value.splice(2, 0, {
      key: "state",
      title: () => "주문상태",
      render: (row) => orderStateKo(row.orderState),
    });
  }
});

const getTargets = () =>
  orderProds.value.filter((x) => checkedKeys.value.includes(x.shopProdId));
function getOrderByShop(targets: VendorUserOrderProd[]) {
  const orderDbIdByShops: { [shopId: string]: string[] } = {};
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    if (!orderDbIdByShops[target.shopId]) {
      orderDbIdByShops[target.shopId] = [target.dbId];
    } else {
      orderDbIdByShops[target.shopId].push(target.dbId);
    }
  }
  return orderDbIdByShops;
}
const msging = (len: number) =>
  msg.success(`주문 ${len}건 처리완료 `, makeMsgOpt());

async function approveChecked() {
  const targets = getTargets();
  targets.forEach((t) => {
    t.stockCnt = t.stockCnt - (t.orderCnt - t.pendingCnt);
    log.debug("to stockCnt: ", t.stockCnt);
    if (t.stockCnt < 0) {
      return log.error(null, "상품재고량은 0 이하가 될 수 없습니다.");
    }
  });
  return Promise.all([
    vendorProdsModify(targets.map((t) => VendorProd.fromJson(t)!)),
    updateOrderBatch({
      orderDbIdByShops: getOrderByShop(targets),
      orderState: ORDER_STATE.BEFORE_PAYMENT,
    }),
  ])
    .then(() => msging(targets.length))
    .catch(() => msg.error(`처리실패 `, makeMsgOpt()));
}

async function rejectChecked() {
  const targets = getTargets();
  updateOrderBatch({
    orderDbIdByShops: getOrderByShop(targets),
    orderState: ORDER_STATE.BEFORE_ORDER,
  })
    .then(() => msging(targets.length))
    .catch(() => msg.error(`처리실패 `, makeMsgOpt()));
}

async function depositedChecked() {
  const targets = getTargets();
  if (targets.some((x) => x.orderState !== ORDER_STATE.BEFORE_PAYMENT)) {
    return msg.error("결재대기중인 주문만 가능합니다. ", makeMsgOpt());
  }
  return updateOrderBatch({
    orderDbIdByShops: getOrderByShop(targets),
    orderState: ORDER_STATE.BEFORE_SHIP,
  })
    .then(() => msging(targets.length))
    .catch(() => msg.error(`처리실패 `, makeMsgOpt()));
}

async function cancelChecked() {
  const targets = getTargets();
  targets.forEach((t) => {
    t.stockCnt = t.stockCnt + (t.orderCnt - t.pendingCnt);
    log.debug("to stockCnt: ", t.stockCnt);
  });
  return Promise.all([
    rejectChecked(),
    vendorProdsModify(targets.map((t) => VendorProd.fromJson(t)!)),
  ])
    .then(() => msging(targets.length))
    .catch(() => msg.error(`처리실패 `, makeMsgOpt()));
}
</script>
<template>
  <n-card>
    <template #header>
      <div></div>
    </template>
    <template #header-extra>
      <n-space
        justify="start"
        v-if="inStates && inStates.includes(ORDER_STATE.BEFORE_APPROVE)"
      >
        <n-button size="small" type="primary" @click="approveChecked">
          선택주문승인
        </n-button>
        <n-button size="small" type="primary" @click="rejectChecked">
          선택주문거부
        </n-button>
      </n-space>
      <n-space
        justify="start"
        v-if="
          notStates &&
          notStates.includes(ORDER_STATE.BEFORE_APPROVE) &&
          notStates.includes(ORDER_STATE.BEFORE_ORDER)
        "
      >
        <n-button size="small" type="primary" @click="depositedChecked">
          선택결제완료처리
        </n-button>
        <n-button size="small" type="primary" @click="cancelChecked">
          선택미결제 취소
        </n-button>
      </n-space>
    </template>
    <n-data-table
      ref="tableRef"
      :table-layout="getScreenSize() === ScreenSize.L ? 'fixed' : 'auto'"
      :scroll-x="800"
      :columns="columns"
      :data="tableData"
      :pagination="{
        pageSize: 5,
      }"
      :bordered="false"
      style="min-height: 50vh"
    />
  </n-card>
</template>
