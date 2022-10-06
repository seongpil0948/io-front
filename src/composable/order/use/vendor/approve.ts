import {
  GarmentOrder,
  ORDER_GARMENT_DB,
  ProdOrderByShop,
  ProdOrderCombined,
  useAlarm,
} from "@/composable";
import { IO_COSTS } from "@/constants";
import { logger } from "@/plugin/logger";
import { makeMsgOpt, uniqueArr } from "@/util";
import {
  DataTableColumns,
  DataTableRowKey,
  NButton,
  NSpace,
  useMessage,
} from "naive-ui";
import { computed, h, ref, Ref, VNode } from "vue";
import GarmentOrderRow from "@/component/table/vendor/GarmentOrderRow.vue";
import { useAuthStore } from "@/store";

interface ApproveParam {
  garmentOrders: Ref<ProdOrderCombined[]>;
  orders: Ref<GarmentOrder[]>;
  vendorId: string;
  expandCol: boolean;
  detailCol: boolean;
}
export function useApproveOrder(p: ApproveParam) {
  const checkedOrders = ref<string[]>([]); // garment order id
  const checkedShops = ref<DataTableRowKey[]>([]); // shop id
  const msg = useMessage();
  const smtp = useAlarm();
  const auth = useAuthStore();
  // Partial
  const numOfAllow = ref(0);
  const showPartialModal = ref(false);
  const detailShopIds = ref<string[]>([]);
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
          // FIXME: 기존 주문건도 사라지는 게 있음, 수동으로 주문개수하지말고, setOrderCnt 이용해서 하고 update 함수 사용도 지양
          item.activeCnt = numOfAllow.value;
          item.pendingCnt = item.orderCnt - numOfAllow.value;
          o.update().then(() =>
            ORDER_GARMENT_DB.orderApprove(p.vendorId, [o.dbId], [item.id])
              .then(() => {
                msg.success("부분승인 완료", makeMsgOpt());
              })
              .catch((err) => {
                const message = `부분승인 실패 ${
                  err instanceof Error ? err.message : JSON.stringify(err)
                }`;
                msg.error(message, makeMsgOpt());
                logger.error(p.vendorId, message);
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
    const shopIds = [] as string[];
    for (let i = 0; i < p.orders.value.length; i++) {
      const o = p.orders.value[i];
      for (let j = 0; j < o.items.length; j++) {
        const item = o.items[j];
        if (prodIds.includes(item.id) && !orderDBIds.includes(o.dbId)) {
          orderDBIds.push(o.dbId);
          if (!shopIds.includes(o.shopId)) {
            shopIds.push(o.shopId);
          }
        }
      }
    }
    ORDER_GARMENT_DB.orderApprove(p.vendorId, orderDBIds, prodIds)
      .then(async () => {
        await smtp.sendAlarm({
          toUserIds: shopIds,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${auth.currUser.name} 에서 주문 요청을 승인하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
        msg.success("주문승인 완료", makeMsgOpt());
      })
      .catch((err) => {
        const message = `주문승인 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        msg.success(message, makeMsgOpt());
        logger.error(p.vendorId, message);
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
  const targetOrdDbIds = computed(() => {
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

  const targetShopIds = computed(() =>
    uniqueArr(
      p.orders.value
        .filter((x) => targetOrdDbIds.value.has(x.dbId))
        .map((y) => y.shopId)
    )
  );
  async function rejectSelected() {
    ORDER_GARMENT_DB.orderReject(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${auth.currUser.name} 에서 주문 요청을 거절 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
        msg.success("주문거절 완료", makeMsgOpt());
      })
      .catch((err) => {
        const message = `주문거절 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        msg.success(message, makeMsgOpt());
        logger.error(p.vendorId, message);
      })
      .finally(() => {
        orderTargets.value = [];
        updateOrderModal(false);
      });
  }
  function completePay() {
    ORDER_GARMENT_DB.completePay(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        msg.success("결제승인 완료", makeMsgOpt());
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${auth.currUser.name} 에서 결제를 승인 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
      })
      .catch((err) => {
        const message = `결제승인 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        msg.error(message, makeMsgOpt());
        logger.error(p.vendorId, message);
      });
  }
  function returnApproved() {
    ORDER_GARMENT_DB.returnApprove(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        msg.success("반품 승인 완료", makeMsgOpt());
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${auth.currUser.name} 에서 반품을 승인 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
      })
      .catch((err) => {
        const message = `반품승인 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        msg.error(message, makeMsgOpt());
        logger.error(p.vendorId, message);
      });
  }
  function returnReject() {
    ORDER_GARMENT_DB.returnReject(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        msg.success("반품 거절 완료", makeMsgOpt());
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${auth.currUser.name} 에서 반품을 거절 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
      })
      .catch((err) => {
        const message = `반품거절 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        msg.error(message, makeMsgOpt());
        logger.error(p.vendorId, message);
      });
  }
  function onProdReady() {
    ORDER_GARMENT_DB.orderToReady(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        msg.success("출고리스트 업로드 완료", makeMsgOpt());
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${auth.currUser.name} 에서 출고리스트에 주문을 업로드 하였습니다.<br> 이제 배송요청이 가능합니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
      })
      .catch((err) => {
        const message = `출고리스트 업로드 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        msg.error(message, makeMsgOpt());
        logger.error(p.vendorId, message);
      });
  }
  // <<< Order <<<
  const columns = computed(() => {
    const cols = [
      {
        type: "selection",
      },
    ] as DataTableColumns<ProdOrderByShop>;
    if (p.expandCol)
      cols.push({
        type: "expand",
        expandable: (row) => row.items.length > 0,
        renderExpand: (row) => {
          const children: VNode[] = [];
          for (let i = 0; i < row.items.length; i++) {
            const item = row.items[i];
            const garmentOrder = p.orders.value.find(
              (o) => o.dbId === item.orderDbId
            );
            if (garmentOrder)
              children.push(
                h(GarmentOrderRow, {
                  garmentOrder,
                  itemId: item.id,
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
      });

    cols.push(
      ...([
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
      ] as DataTableColumns<ProdOrderByShop>)
    );
    if (p.detailCol)
      cols.push({
        title: "상세",
        key: "detail",
        render: (row) =>
          h(
            NButton,
            {
              text: true,
              onClick: async () => {
                const d = detailShopIds.value;
                if (d.includes(row.shopId)) {
                  d.splice(d.indexOf(row.shopId), 1);
                } else {
                  d.push(row.shopId);
                }
              },
            },
            { default: () => "상세보기" }
          ),
      });
    return cols.map((x: any) => {
      if (!["selection", "expand"].includes(x.type)) {
        x.sorter = "default";
        x.width = "120";
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
    columns,
    orderTargets,
    showPartialModal,
    numOfAllow,
    completePay,
    onProdReady,
    detailShopIds,
    checkedOrders,
    returnApproved,
    returnReject,
  };
}
