<script setup lang="ts">
import { computed, h, ref, VNode } from "vue";
import {
  NTag,
  NButton,
  useMessage,
  DataTableColumns,
  NSpace,
  DataTableRowKey,
} from "naive-ui";
import GarmentOrderRow from "@/component/table/vendor/GarmentOrderRow.vue";
import {
  GarmentOrder,
  ORDER_GARMENT_DB,
  ORDER_STATE,
  ProdOrder,
  ProdOrderByShop,
  ProdOrderCombined,
  useReadVendorOrderGInfo,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { logger } from "@/plugin/logger";

const props = defineProps<{
  inStates?: ORDER_STATE[];
}>();

const auth = useAuthStore();
const u = auth.currUser;
const { orders, garmentOrders, garmentOrdersByShop } = useReadVendorOrderGInfo(
  auth.currUser.userInfo.userId,
  props.inStates ?? []
);

const checkedOrders = ref<string[]>([]); // garment order id
const checkedShops = ref<DataTableRowKey[]>([]); // shop id
const showPartialModal = ref(false);
const msg = useMessage();
const numOfAllow = ref(0);
function getRowKey(row: ProdOrderByShop) {
  return row.shopId;
}
function onClickShop(keys: DataTableRowKey[]) {
  checkedShops.value = keys;
}
async function approvePartial() {
  for (let i = 0; i < orders.value.length; i++) {
    const o = orders.value[i];

    const prodOrders = o.getProdOrders(checkedOrders.value[0]);
    if (prodOrders && prodOrders.length > 0) {
      prodOrders[0].activeCnt = numOfAllow.value;
      prodOrders[0].pendingCnt = prodOrders[0].orderCnt - numOfAllow.value;
      o.setState(prodOrders[0].id, "BEFORE_PAYMENT");
      o.update()
        .then(() => {
          msg.success("주문승인 완료", makeMsgOpt());
        })
        .catch((err) => {
          msg.success("주문승인 실패", makeMsgOpt());
          logger.error(u.userInfo.userId, "error in approvePartial", err);
        });
    }
  }
}
const targetIds = computed(() => {
  const itemIds = new Set<string>();
  for (let i = 0; i < orders.value.length; i++) {
    const o = orders.value[i];
    if (checkedShops.value.includes(o.shopId)) {
      o.items.forEach((x) => itemIds.add(x.id));
    }
    for (let j = 0; j < o.items.length; j++) {
      const item = o.items[j];
      if (checkedOrders.value.includes(item.id) && !itemIds.has(item.id)) {
        itemIds.add(item.id);
      }
    }
  }
  // return garmentOrders.value.filter((z) => itemIds.has(z.id));
  return itemIds;
});
async function approveSelected() {
  const orderIds = new Set<string>();
  for (let i = 0; i < orders.value.length; i++) {
    const o = orders.value[i];

    for (let j = 0; j < o.items.length; j++) {
      const item = o.items[j];
      if (targetIds.value.has(item.id)) {
        o.setState(item.id, "BEFORE_PAYMENT");
        await o.update(); // 유저 금액도 차감해야함
        orderIds.add(o.dbId);
      }
    }
  }
  ORDER_GARMENT_DB.orderApprove(
    u.userInfo.userId,
    [...orderIds],
    [...targetIds.value]
  )
    .then(() => msg.success("주문승인에 성공 하셨습니다."))
    .catch((err) => {
      msg.error(`주문승인에 실패 하였습니다. ${err}`);
    });
}
async function rejectSelected() {
  for (let i = 0; i < orders.value.length; i++) {
    const o = orders.value[i];

    for (let j = 0; j < o.items.length; j++) {
      const item = o.items[j];
      if (targetIds.value.has(item.id)) {
        o.setState(item.id, "BEFORE_ORDER");
        await o.update();
      }
    }
  }
}
async function approveAll() {
  for (let i = 0; i < orders.value.length; i++) {
    const o = orders.value[i];
    ORDER_GARMENT_DB.orderApprove(
      u.userInfo.userId,
      orders.value.map((x) => x.dbId),
      garmentOrders.value.map((y) => y.id)
    )
      .then(() => msg.success("주문승인에 성공 하셨습니다."))
      .catch((err) => {
        msg.error(`주문승인에 실패 하였습니다. ${err}`);
      });
  }
}
function showPartial() {
  const ts = checkedOrders.value;
  if (ts.length !== 1) {
    return msg.error("부분승인은 1행씩 선택 가능합니다.");
  }
  showPartialModal.value = true;
}
function onCloseModal() {
  console.log("approveAll, checkedShops: ", checkedShops.value);
  numOfAllow.value = 0;
  showPartialModal.value = false;
}

const columns = computed(() => {
  const cols = [
    {
      type: "selection",
    },
    {
      type: "expand",
      expandable: (row) => row.items.length > 0,
      renderExpand: (row) => {
        const children: VNode[] = [];
        for (let i = 0; i < row.items.length; i++) {
          const item = row.items[i];
          children.push(
            h(GarmentOrderRow, {
              garmentOrder: item as ProdOrderCombined,
              checked: checkedOrders.value.includes(item.id),
              onClick: () => {
                const cs = checkedOrders.value;
                if (cs.includes(item.id)) {
                  cs.splice(
                    cs.findIndex((x) => x === item.id),
                    1
                  );
                } else {
                  cs.push(item.id);
                }
              },
            })
          );
        }
        return h(
          NSpace,
          { vertical: true, style: { "margin-left": "4%" } },
          { default: () => children }
        );
      },
    },
    {
      title: "#",
      key: "key",
      render: (_, index) => {
        return `${index + 1}`;
      },
    },
    {
      title: "거래처명",
      key: "name",
      render: (row) => row.shopName,
    },
    {
      title: "품목수량",
      key: "age",
      render: (row) => row.items.length,
    },
    {
      title: "주문수량",
      key: "orderCnt",
      render: (row) => row.items.reduce((acc, curr) => acc + curr.orderCnt, 0),
    },
    {
      title: "미송개수",
      key: "pendingCnt",
      render: (row) =>
        row.items.reduce((acc, curr) => acc + curr.pendingCnt, 0),
    },
    {
      title: "결제금액",
      key: "orderAmount",
      render: (row) =>
        row.items
          .reduce((acc, curr) => acc + curr.actualAmount.orderAmount, 0)
          .toLocaleString(),
    },
  ] as DataTableColumns<ProdOrderByShop>;
  return cols.map((x: any) => {
    if (!["selection", "expand"].includes(x.type)) {
      x.sorter = "default";
    }
    return x;
  });
});
</script>

<template>
  <n-card :bordered="false">
    <template #header> <div></div> </template>
    <template #header-extra>
      <n-space>
        <n-button size="small" type="primary" @click="showPartial">
          부분승인(미송)
        </n-button>
        <n-button size="small" type="primary" @click="approveSelected">
          선택승인
        </n-button>
        <n-button size="small" type="primary" @click="rejectSelected">
          선택거부
        </n-button>
        <n-button size="small" type="primary" @click="approveAll">
          전체승인
        </n-button>
      </n-space>
    </template>
    <n-data-table
      :bordered="false"
      :columns="columns"
      :data="garmentOrdersByShop"
      :rowKey="getRowKey"
      :handleCheck="onClickShop"
      default-expand-all
    />
  </n-card>

  <n-modal v-model:show="showPartialModal">
    <n-card
      style="width: 40vw"
      title="[ 부분승인 ]"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-space vertical align="center">
        <n-text>몇장만 승인 할까요?</n-text>
        <n-text depth="3">나머지 개수는 미송 주문건으로 이동됩니다.</n-text>
        <n-input-number v-model:value="numOfAllow"></n-input-number>
      </n-space>

      <template #footer>
        <n-space justify="end">
          <n-button @click="approvePartial">저장</n-button>
          <n-button @click="onCloseModal">닫기</n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>
