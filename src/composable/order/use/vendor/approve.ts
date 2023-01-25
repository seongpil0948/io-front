import { getUserName, getIoCollection, IoCollection } from "@io-boxies/js-lib";
import {
  IoOrder,
  IoPay,
  ORDER_GARMENT_DB,
  OrderItemByShop,
  OrderItemCombined,
  dividePartial,
  VendorGarment,
  OrderItem,
  catchError,
} from "@/composable";
import { IO_COSTS } from "@/constants";
import { makeMsgOpt, uniqueArr } from "@/util";
import {
  DataTableColumns,
  DataTableRowKey,
  NButton,
  NSpace,
  useMessage,
} from "naive-ui";
import { computed, h, ref, Ref, VNode, defineAsyncComponent } from "vue";
import { useAuthStore } from "@/store";
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { axiosConfig } from "@/plugin/axios";
import { useAlarm } from "@io-boxies/vue-lib";
import { ioFire, ioFireStore } from "@/plugin/firebase";
import { logEvent, getAnalytics } from "@firebase/analytics";

const GarmentOrderRow = defineAsyncComponent(
  () => import("@/component/table/vendor/GarmentOrderRow.vue")
);
export async function reduceStockCnt(
  vendorProd: VendorGarment,
  orderItem: OrderItem
) {
  if (vendorProd.stockCnt < orderItem.orderCnt)
    throw new Error(
      `${vendorProd.vendorProdName}상품의 재고개수(${vendorProd.stockCnt})가 주문개수(${orderItem.orderCnt}) 보다 적습니다.`
    );
  else {
    vendorProd.stockCnt -= orderItem.orderCnt;
    await vendorProd.update();
  }
  return orderItem;
}

interface ApproveParam {
  ioOrders: Ref<OrderItemCombined[]>;
  orders: Ref<IoOrder[]>;
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

    const targetOrderItemId = checkedOrders.value[0];
    for (let i = 0; i < p.orders.value.length; i++) {
      const o = p.orders.value[i];
      for (let j = 0; j < o.items.length; j++) {
        const item = o.items[j];
        if (item.id === targetOrderItemId) {
          if (numOfAllow.value > item.orderCnt) {
            return msg.error(
              "부분승인은 개수는 주문개수 이하로 설정 되어야합니다."
            );
          }
          const newId = await dividePartial({
            order: o,
            itemId: item.id,
            orderCnt: numOfAllow.value,
            update: false,
          });
          const docRef = doc(
            getIoCollection(ioFireStore, { c: IoCollection.IO_PAY }),
            o.shopId
          ).withConverter(IoPay.fireConverter());
          const docSnap = await getDoc(docRef);
          const userPay = docSnap.data();
          if (docSnap.exists() && userPay) {
            updateDoc(docRef, { pendingBudget: userPay.pendingBudget + 1 });
          }
          await ORDER_GARMENT_DB.updateOrder(o);
          ORDER_GARMENT_DB.orderApprove(p.vendorId, [o.dbId], [newId])
            .then(async () => {
              msg.success("부분승인 완료", makeMsgOpt());
              logEvent(getAnalytics(ioFire.app), "order_approve_partial", {
                len: targetIds.value.size,
              });
            })
            .catch((err) =>
              catchError({ err, msg, prefix: "부분승인 실패", uid: p.vendorId })
            )
            .finally(() => {
              onCloseModal(false);
            });
          targetIds.value.clear();
          checkedShops.value = [];

          break;
        }
      }
    }
  }
  // >>> Order >>>
  const orderTargets = computed<OrderItemCombined[]>(() =>
    p.ioOrders.value.filter((x) => targetIds.value.has(x.id))
  );
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
    // return ioOrders.value.filter((z) => itemIds.has(z.id));
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
    const prodIds = [...targetIds.value];
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
        msg.success("주문승인 완료", makeMsgOpt());
        logEvent(getAnalytics(ioFire.app), "order_approve", {
          len: targetIds.value.size,
        });
        await smtp.sendAlarm({
          toUserIds: shopIds,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${getUserName(
            auth.currUser
          )} 에서 주문 요청을 승인하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
        });
      })
      .catch((err) =>
        catchError({ err, msg, prefix: "주문승인 실패", uid: p.vendorId })
      )
      .finally(() => {
        targetIds.value.clear();
        checkedOrders.value = [];
        updateOrderModal(false);
      });
  }

  function approveSelected() {
    showOrderModal.value = true;
  }

  function approveAll() {
    p.ioOrders.value.forEach((po) => targetIds.value.add(po.id));
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
        msg.success("주문거절 완료", makeMsgOpt());
        logEvent(getAnalytics(ioFire.app), "order_reject", {
          len: targetIds.value.size,
        });
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${getUserName(
            auth.currUser
          )} 에서 주문 요청을 거절 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
        });
      })
      .catch((err) =>
        catchError({ err, msg, prefix: "주문거절 실패", uid: p.vendorId })
      )
      .finally(() => {
        targetIds.value.clear();
        checkedShops.value = [];
        updateOrderModal(false);
      });
  }

  function returnApproved() {
    ORDER_GARMENT_DB.returnApprove(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        msg.success("반품 승인 완료", makeMsgOpt());
        logEvent(getAnalytics(ioFire.app), "return_approve", {
          len: targetIds.value.size,
        });
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${getUserName(auth.currUser)} 에서 반품을 승인 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
        });
      })
      .catch((err) =>
        catchError({ err, msg, prefix: "반품승인 실패", uid: p.vendorId })
      );
  }
  function returnReject() {
    ORDER_GARMENT_DB.returnReject(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        msg.success("반품 거절 완료", makeMsgOpt());
        logEvent(getAnalytics(ioFire.app), "return_reject", {
          len: targetIds.value.size,
        });
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${getUserName(auth.currUser)} 에서 반품을 거절 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
        });
      })
      .catch((err) =>
        catchError({ err, msg, prefix: "반품거절 실패", uid: p.vendorId })
      );
  }
  function onProdReady() {
    ORDER_GARMENT_DB.orderToReady(
      [...targetOrdDbIds.value],
      [...targetIds.value]
    )
      .then(async () => {
        msg.success("출고리스트 업로드 완료", makeMsgOpt());
        logEvent(getAnalytics(ioFire.app), "order_to_ready", {
          len: targetIds.value.size,
        });
        await smtp.sendAlarm({
          toUserIds: targetShopIds.value,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${getUserName(
            auth.currUser
          )} 에서 출고리스트에 주문을 업로드 하였습니다. 이제 배송요청이 가능합니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
        });
      })
      .catch((err) =>
        catchError({
          err,
          msg,
          prefix: "출고리스트 업로드 실패",
          uid: p.vendorId,
        })
      );
  }
  // <<< Order <<<
  const columns = computed(() => {
    const cols = [
      {
        type: "selection",
      },
    ] as DataTableColumns<OrderItemByShop>;
    if (p.expandCol)
      cols.push({
        type: "expand",
        expandable: (row) => row.items.length > 0,
        renderExpand: (row) => {
          const children: VNode[] = [];
          for (let i = 0; i < row.items.length; i++) {
            const item = row.items[i];
            const ioOrder = p.orders.value.find(
              (o) => o.dbId === item.orderDbId
            );
            if (ioOrder)
              children.push(
                h(GarmentOrderRow, {
                  ioOrder,
                  orderItem: item,
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
              .reduce((acc, curr) => acc + curr.amount.orderAmount, 0)
              .toLocaleString(),
        },
      ] as DataTableColumns<OrderItemByShop>)
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
    onProdReady,
    detailShopIds,
    checkedOrders,
    returnApproved,
    returnReject,
    targetIds,
    targetOrdDbIds,
    targetShopIds,
  };
}
