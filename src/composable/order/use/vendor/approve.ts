import {
  GarmentOrder,
  ORDER_GARMENT_DB,
  ProdOrderByShop,
  ProdOrderCombined,
} from "@/composable";
import { IO_COSTS } from "@/constants";
import { logger } from "@/plugin/logger";
import { makeMsgOpt } from "@/util";
import {
  DataTableColumns,
  DataTableRowKey,
  NSpace,
  useMessage,
} from "naive-ui";
import { computed, h, ref, Ref, VNode } from "vue";
import GarmentOrderRow from "@/component/table/vendor/GarmentOrderRow.vue";

interface ApproveParam {
  garmentOrders: Ref<ProdOrderCombined[]>;
  orders: Ref<GarmentOrder[]>;
  vendorId: string;
}
export function useApproveOrder(p: ApproveParam) {
  const checkedOrders = ref<string[]>([]); // garment order id
  const checkedShops = ref<DataTableRowKey[]>([]); // shop id
  const msg = useMessage();
  // Partial
  const numOfAllow = ref(0);
  const showPartialModal = ref(false);
  function showPartial() {
    const ts = checkedOrders.value;
    if (ts.length !== 1) {
      return msg.error("부분승인은 1행씩 선택 가능합니다.");
    }
    showPartialModal.value = true;
  }
  function onCloseModal(val: boolean) {
    if (!val) {
      numOfAllow.value = 0;
      showPartialModal.value = false;
    }
  }

  async function approvePartial() {
    if (numOfAllow.value < 0) {
      return msg.error("부분승인은 개수는 0이상 이어야 합니다.");
    }

    const targetProdOrderId = checkedOrders.value[0];
    for (let i = 0; i < p.orders.value.length; i++) {
      const o = p.orders.value[i];
      for (let j = 0; j < o.items.length; j++) {
        const item = o.items[j];
        if (item.id === targetProdOrderId) {
          if (numOfAllow.value > item.orderCnt) {
            return msg.error(
              "부분승인은 개수는 주문개수 이하로 설정 되어야합니다."
            );
          }
          item.activeCnt = numOfAllow.value;
          item.pendingCnt = item.orderCnt - numOfAllow.value;
          o.update().then(() =>
            ORDER_GARMENT_DB.orderApprove(p.vendorId, [o.dbId], [item.id])
              .then(() => {
                msg.success("부분승인 완료", makeMsgOpt());
              })
              .catch((err) => {
                msg.error("부분승인 실패", makeMsgOpt());
                logger.error(p.vendorId, "error in approvePartial", err);
              })
              .finally(() => {
                onCloseModal(false);
              })
          );

          break;
        }
      }
    }
  }
  // >>> Order >>>
  const orderTargets = ref<ProdOrderCombined[]>([]);
  const orderReduceCoins = computed(
    () => orderTargets.value.length * IO_COSTS.APPROVE_ORDER
  );
  const showOrderModal = ref(false);
  function updateOrderModal(val: boolean) {
    if (!val) {
      showOrderModal.value = false;
    }
  }
  function onClickShop(keys: DataTableRowKey[]) {
    checkedShops.value = keys;
  }

  async function approveGarments() {
    const prodIds = orderTargets.value.map((x) => x.id);
    const orderDBIds: string[] = [];
    for (let i = 0; i < p.orders.value.length; i++) {
      const o = p.orders.value[i];
      for (let j = 0; j < o.items.length; j++) {
        const item = o.items[j];
        if (prodIds.includes(item.id) && !orderDBIds.includes(o.dbId)) {
          orderDBIds.push(o.dbId);
        }
      }
    }
    ORDER_GARMENT_DB.orderApprove(p.vendorId, orderDBIds, prodIds)
      .then(() => {
        msg.success("주문승인 완료", makeMsgOpt());
      })
      .catch((err) => {
        msg.success("주문승인 실패", makeMsgOpt());
        logger.error(p.vendorId, "error in approvePartial", err);
      })
      .finally(() => {
        orderTargets.value = [];
        updateOrderModal(false);
      });
  }

  const targetIds = computed(() => {
    const itemIds = new Set<string>();
    for (let i = 0; i < p.orders.value.length; i++) {
      const o = p.orders.value[i];
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
  const targetOrderIds = computed(() => {
    const orderIds = new Set<string>();
    for (let i = 0; i < p.orders.value.length; i++) {
      const o = p.orders.value[i];

      for (let j = 0; j < o.items.length; j++) {
        const item = o.items[j];
        if (targetIds.value.has(item.id)) {
          orderIds.add(o.dbId);
        }
      }
    }
    return orderIds;
  });
  function approveSelected() {
    orderTargets.value = p.garmentOrders.value.filter((x) =>
      targetIds.value.has(x.id)
    );
    showOrderModal.value = true;
  }

  function approveAll() {
    orderTargets.value = p.garmentOrders.value;
    showOrderModal.value = true;
  }

  async function rejectSelected() {
    ORDER_GARMENT_DB.orderReject(
      [...targetOrderIds.value],
      [...targetIds.value]
    )
      .then(() => {
        msg.success("주문거절 완료", makeMsgOpt());
      })
      .catch((err) => {
        msg.success("주문거절 실패", makeMsgOpt());
        logger.error(p.vendorId, "error in reject order", err);
      })
      .finally(() => {
        orderTargets.value = [];
        updateOrderModal(false);
      });
  }
  function completePay() {
    ORDER_GARMENT_DB.completePay(
      [...targetOrderIds.value],
      [...targetIds.value]
    )
      .then(() => {
        msg.success("결제승인 완료", makeMsgOpt());
      })
      .catch((err) => {
        msg.error(`결제승인 실패 ${JSON.stringify(err)}`, makeMsgOpt());
        logger.error(p.vendorId, "error in complete payment", err);
      });
  }
  function onProdReady() {
    ORDER_GARMENT_DB.orderToReady(
      [...targetOrderIds.value],
      [...targetIds.value]
    )
      .then(() => {
        msg.success("출고리스트 업로드 완료", makeMsgOpt());
      })
      .catch((err) => {
        msg.error(
          `출고리스트 업로드 실패 ${JSON.stringify(err)}`,
          makeMsgOpt()
        );
        logger.error(p.vendorId, "error in onProdReady", err);
      });
  }
  // <<< Order <<<
  const expandColumns = computed(() => {
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
        render: (row) =>
          row.items.reduce((acc, curr) => acc + curr.orderCnt, 0),
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
  return {
    showPartial,
    onCloseModal,
    approvePartial,
    orderReduceCoins,
    showOrderModal,
    updateOrderModal,
    onClickShop,
    approveGarments,
    approveSelected,
    approveAll,
    rejectSelected,
    expandColumns,
    orderTargets,
    showPartialModal,
    numOfAllow,
    completePay,
    onProdReady,
  };
}
