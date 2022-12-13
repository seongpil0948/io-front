/* eslint-disable @typescript-eslint/no-unused-vars */
import { extractGarmentOrd } from "@/util";
import {
  ORDER_GARMENT_DB,
  useShopUserGarments,
  OrderItemCombined,
  OrderItemByVendor,
  ORDER_STATE,
  IoOrder,
  ShopUserGarment,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { defineStore } from "pinia";
import { ref, computed, onBeforeUnmount, watchEffect } from "vue";
import { useAuthStore } from "./auth";
import { Unsubscribe } from "@firebase/firestore";
import { logger } from "@/plugin/logger";

export const useShopOrderStore = defineStore("shopOrderStore", () => {
  // >>> state >>>
  logger.debug("=== called shopOrderStore ===");
  const authStore = useAuthStore();
  const inStates = ref<ORDER_STATE[]>([]);
  const shopId = ref<string | null>(null);
  const _orders = ref<IoOrder[]>([]);
  let orderUnSub: null | Unsubscribe = null;
  const shopProds = ref<ShopUserGarment[]>([]);
  let shopGarmentUnSub: null | Unsubscribe = null;
  const _ioOrders = ref<OrderItemCombined[]>([]);
  let initial = true;
  const existOrderIds = ref<Set<string>>(new Set());
  async function setExistOrderIds() {
    if (shopId.value)
      existOrderIds.value = await ORDER_GARMENT_DB.getExistOrderIds(
        shopId.value
      );
  }
  // >>> getter >>>
  function getOrders(inStates: ORDER_STATE[]) {
    return computed(() =>
      _orders.value.filter((x) => x.states.some((y) => inStates.includes(y)))
    );
  }
  function getFilteredOrder(inStates: ORDER_STATE[]) {
    return computed(() =>
      ioOrders.value.filter((x) => inStates.includes(x.state))
    );
  }

  function getGarmentOrdersByVendor(ioOrders: typeof _ioOrders) {
    return computed(() =>
      ioOrders.value.reduce((acc, curr) => {
        const exist = acc.find((x) => x.vendorId === curr.vendorId);
        if (!exist) {
          const account = curr.vendorProd.userInfo.account;
          const accStr = `${account?.bank.toString()} ${account?.accountName} ${
            account?.accountNumber
          }`;
          acc.push({
            vendorId: curr.vendorId,
            vendorName:
              curr.vendorProd.userInfo.displayName ??
              curr.vendorProd.userInfo.userName,
            orderCnt: curr.orderCnt,
            pendingCnt: curr.pendingCnt,
            accountStr: account === undefined ? "미등록" : accStr,
            phone:
              curr.vendorProd.userInfo.phone ??
              curr.vendorProd.companyInfo?.managerPhone ??
              "미등록",
            items: [curr],
          });
          return acc;
        }
        exist.orderCnt += curr.orderCnt;
        exist.pendingCnt += curr.pendingCnt;
        exist.items.push(curr);
        return acc;
      }, [] as OrderItemByVendor[])
    );
  }
  const orders = computed(() => [..._orders.value]);
  const ioOrders = computed(() => [..._ioOrders.value]);

  const unsubscribeAuth = authStore.$onAction(
    ({ name, store, args, after, onError }) => {
      after(async () => {
        const u = store.user;
        if (name === "login") {
          if (!u) throw new Error("User is null");
          else if (u.userInfo.role === "SHOP") {
            init(u.userInfo.userId);
          }
        } else if (name === "logout") {
          discard();
        } else if (!u && !initial) {
          discard();
        }
      });
      onError((error) => {
        logger.error(store.user?.userInfo.userId, error);
        discard();
      });
    },
    true
  );
  watchEffect(async () => {
    if (shopId.value && orders.value.length > 0 && shopProds.value.length > 0) {
      await setExistOrderIds();
      const vendorProdIds = orders.value.flatMap((o) =>
        o.items.map((i) => i.vendorProd.vendorProdId)
      );
      const prods = await VENDOR_GARMENT_DB.listByIdsWithUser(vendorProdIds);
      _ioOrders.value = extractGarmentOrd(
        _orders.value,
        shopProds.value,
        prods
      );
    } else {
      existOrderIds.value.clear();
    }
  });
  onBeforeUnmount(() => {
    inStates.value = [];
  });
  // >>> action >>>
  function init(shopUserId: string) {
    if (!initial || !shopUserId || shopUserId === shopId.value) return;
    logger.debug(`=== init shopOrderStore === shopUserId: ${shopUserId}`);
    shopId.value = shopUserId;
    const { unsubscribe: orderUnsubscribe } = ORDER_GARMENT_DB.shopReadListen({
      shopId: shopId.value,
      inStates: [],
      orders: _orders,
    });
    orderUnSub = orderUnsubscribe;
    initial = false;
    const { userProd, unsubscribe } = useShopUserGarments({
      shopId: shopId.value,
      onChanged: (prods) => {
        shopProds.value = prods;
      },
    });
    // eslint-disable-next-line vue/no-ref-as-operand
    shopGarmentUnSub = unsubscribe;
  }

  function discard() {
    console.log(`=== discard shopOrderStore === `);
    if (orderUnSub) {
      orderUnSub();
    }
    if (shopGarmentUnSub) {
      shopGarmentUnSub();
    }
    orderUnSub = null;
    shopGarmentUnSub = null;
    inStates.value = [];
    shopId.value = null;
    _orders.value = [];
    _ioOrders.value = [];
    shopProds.value = [];
    initial = true;
  }
  function setInStates(states: ORDER_STATE[]) {
    inStates.value = states;
  }

  // const setExistOrderIds = debounce(async () => {
  //   if (shopId.value)
  //     existOrderIds.value = await ORDER_GARMENT_DB.getExistOrderIds(
  //       shopId.value
  //     );
  // }, 1000);

  return {
    existOrderIds,
    shopProds,
    getOrders,
    unsubscribeAuth,
    ioOrders,
    getGarmentOrdersByVendor,
    getFilteredOrder,
    setInStates,
    init,
    orders,
  };
});
