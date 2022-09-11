<script setup lang="ts">
import { ProdOrderByShop, ProdOrderCombined, SHIPMENT_DB } from "@/composable";
import { IO_COSTS } from "@/constants";
import { useAuthStore, useUncleOrderStore } from "@/store";
import { makeMsgOpt, uniqueArr } from "@/util";
import {
  DataTableRowKey,
  DataTableColumns,
  NButton,
  useMessage,
} from "naive-ui";
import { computed, h, ref } from "vue";
import { useLogger } from "vue-logger-plugin";

const ordStore = useUncleOrderStore();
const garmentOrders = ordStore.getFilteredOrder(["BEFORE_APPROVE_PICKUP"]);
const garmentOrdersByShop = ordStore.getGarmentOrdersByShop(garmentOrders);
const checkedKeys = ref<DataTableRowKey[]>([]);
function onClickRow(keys: DataTableRowKey[]) {
  checkedKeys.value = keys;
}
function onClickDetail(data: ProdOrderByShop) {
  console.log("onClickDetail data:", data);
}
const columns = computed(() => {
  const cols = [
    {
      type: "selection",
    },
    {
      title: "소매처명",
      key: "shopName",
    },
    {
      title: "도매수량",
      render: (row) =>
        h(
          "div",
          {},
          {
            default: () => uniqueArr(row.items.map((x) => x.vendorId)).length,
          }
        ),
    },

    {
      title: "픽업수량",
      key: "orderCnt",
      render: (row) => row.items.reduce((acc, curr) => acc + curr.orderCnt, 0),
    },
    {
      title: "상세",
      key: "detail",
      render: (row) =>
        h(
          NButton,
          {
            onClick: () => onClickDetail(row),
            size: "small",
          },
          { default: () => "상세보기" }
        ),
    },
  ] as DataTableColumns<ProdOrderByShop>;
  return cols.map((x: any) => {
    if (!["selection", "expand"].includes(x.type)) {
      x.sorter = "default";
    }
    return x;
  });
});
const showApprovePickup = ref(false);
const orderTargets = ref<ProdOrderCombined[]>([]);
function updateReqOrderShow(val: boolean) {
  if (!val) orderTargets.value = [];
  showApprovePickup.value = val;
}
const msg = useMessage();
const log = useLogger();
const auth = useAuthStore();
const expectedReduceCoin = computed(
  () => IO_COSTS.APPROVE_PICKUP * orderTargets.value.length
);
const u = auth.currUser;
async function onReqOrderConfirm() {
  const ids = orderTargets.value.map((x) => x.id);

  return Promise.all(
    ordStore.orders
      .filter((y) => y.items.some((item) => ids.includes(item.id)))
      .map((t) => SHIPMENT_DB.approvePickUp(t, expectedReduceCoin.value))
  )
    .then(() => msg.success("픽업 승인완료.", makeMsgOpt()))
    .catch((err) => {
      console.log("error", err);
      msg.error(`픽업 승인 실패. ${err}`, makeMsgOpt());
      log.error(u.userInfo.userId, `픽업 승인 실패. ${err}`);
    })
    .finally(() => {
      orderTargets.value = [];
      showApprovePickup.value = false;
    });
}
const targetIds = computed(() => {
  const itemIds = new Set<string>();
  for (let i = 0; i < ordStore.orders.length; i++) {
    const o = ordStore.orders[i];
    if (checkedKeys.value.includes(o.shopId)) {
      o.items.forEach((x) => itemIds.add(x.id));
    }
    for (let j = 0; j < o.items.length; j++) {
      const item = o.items[j];
      if (checkedKeys.value.includes(item.id) && !itemIds.has(item.id)) {
        itemIds.add(item.id);
      }
    }
  }
  // return garmentOrders.value.filter((z) => itemIds.has(z.id));
  return itemIds;
});

// const targetOrderIds = computed(() => {
//   const orderIds = new Set<string>();
//   for (let i = 0; i < ordStore.orders.length; i++) {
//     const o = ordStore.orders[i];

//     for (let j = 0; j < o.items.length; j++) {
//       const item = o.items[j];
//       if (targetIds.value.has(item.id)) {
//         orderIds.add(o.dbId);
//       }
//     }
//   }
//   return orderIds;
// });
function approveSelected() {
  orderTargets.value = garmentOrders.value.filter((x) =>
    targetIds.value.has(x.id)
  );
  showApprovePickup.value = true;
}
</script>
<template>
  <n-card>
    <n-space justify="end" style="margin-bottom: 1vh">
      <n-button size="small" type="primary" @click="approveSelected">
        선택승인
      </n-button>
    </n-space>
    <n-data-table
      :bordered="false"
      :columns="columns"
      :data="garmentOrdersByShop"
      :rowKey="(row: ProdOrderByShop) => row.shopId"
      @update:checked-row-keys="onClickRow"
    />
    <coin-reduce-confirm-modal
      v-if="garmentOrdersByShop.length > 0"
      :showModal="showApprovePickup"
      @update:showModal="updateReqOrderShow"
      @onConfirm="onReqOrderConfirm"
      :userId="u.userInfo.userId"
      :expectedReduceCoin="expectedReduceCoin"
    >
      <template #default>
        픽업 승인 완료처리가 되면 품목별 1코인이 소모됩니다.
      </template>
    </coin-reduce-confirm-modal>
  </n-card>
</template>
