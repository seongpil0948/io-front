import { extractGarmentOrd } from "@/util";
import {
  ORDER_GARMENT_DB,
  useShopUserGarments,
  ProdOrderCombined,
  ProdOrderByVendor,
  ORDER_STATE,
  GarmentOrder,
  ShopUserGarment,
} from "@/composable";
import { defineStore, storeToRefs } from "pinia";
import { ref, computed, onBeforeUnmount, watch } from "vue";
import { useVendorsStore } from "./vendorProd";
import { useAuthStore } from "./auth";
import { Unsubscribe } from "@firebase/firestore";
import { logger } from "@/plugin/logger";

export const useShopOrderStore = defineStore("shopOrderStore", () => {
  // >>> state >>>
  logger.debug("=== initiate shopOrderStore ===");
  const authStore = useAuthStore();
  const inStates = ref<ORDER_STATE[]>([]);
  const shopId = ref<string | null>(null);
  const _orders = ref<GarmentOrder[]>([]);
  let orderUnSub: null | Unsubscribe = null;
  let shopGarments = ref<ShopUserGarment[]>([]);
  let shopGarmentUnSub: null | Unsubscribe = null;
  const _garmentOrders = ref<ProdOrderCombined[]>([]);
  let initial = true;

  // >>> getter >>>
  function getOrders(inStates: ORDER_STATE[]) {
    return computed(() =>
      _orders.value.filter((x) => x.states.some((y) => inStates.includes(y)))
    );
  }
  function getFilteredOrder(inStates: ORDER_STATE[]) {
    return computed(() =>
      _garmentOrders.value.filter((x) => inStates.includes(x.state))
    );
  }

  function getGarmentOrdersByVendor(garmentOrders: typeof _garmentOrders) {
    return computed(() =>
      garmentOrders.value.reduce((acc, curr) => {
        const exist = acc.find((x) => x.vendorId === curr.vendorId);
        if (!exist) {
          acc.push({
            vendorId: curr.vendorId,
            vendorName:
              curr.vendorGarment.userInfo.displayName ??
              curr.vendorGarment.userInfo.userName,
            orderCnt: curr.orderCnt,
            pendingCnt: curr.pendingCnt,
            items: [curr],
          });
          return acc;
        }
        exist.orderCnt += curr.orderCnt;
        exist.pendingCnt += curr.pendingCnt;
        exist.items.push(curr);
        return acc;
      }, [] as ProdOrderByVendor[])
    );
  }
  const orders = computed(() => [..._orders.value]);
  const garmentOrders = computed(() => [..._garmentOrders.value]);

  // >>> connection >>>
  const { vendorUserGarments } = storeToRefs(useVendorsStore());
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
  watch(
    () => orders.value,
    async () => {
      if (shopId.value && orders.value) {
        await setExistOrderIds();
        if (shopGarments.value) {
          _garmentOrders.value = extractGarmentOrd(
            _orders.value,
            shopGarments.value,
            vendorUserGarments.value
          );
        }
      } else {
        existOrderIds.value.clear();
      }
    }
  );
  onBeforeUnmount(() => {
    inStates.value = [];
  });
  // >>> action >>>
  function init(shopUserId: string) {
    if (!initial || !shopUserId || shopUserId === shopId.value) return;
    shopId.value = shopUserId;
    const { unsubscribe: orderUnsubscribe } = ORDER_GARMENT_DB.shopReadListen({
      shopId: shopId.value,
      inStates: [],
      orders: _orders,
    });
    orderUnSub = orderUnsubscribe;
    initial = false;
    const { userProd, unsubscribe } = useShopUserGarments(shopId.value, null);
    shopGarments = userProd;
    shopGarmentUnSub = unsubscribe;
  }

  function discard() {
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
    _garmentOrders.value = [];
    shopGarments.value = [];
    initial = true;
  }
  function setInStates(states: ORDER_STATE[]) {
    inStates.value = states;
  }

  const existOrderIds = ref<Set<string>>(new Set());
  async function setExistOrderIds() {
    if (shopId.value)
      existOrderIds.value = await ORDER_GARMENT_DB.getExistOrderIds(
        shopId.value
      );
  }
  // const setExistOrderIds = debounce(async () => {
  //   if (shopId.value)
  //     existOrderIds.value = await ORDER_GARMENT_DB.getExistOrderIds(
  //       shopId.value
  //     );
  // }, 1000);

  return {
    existOrderIds,
    shopGarments,
    getOrders,
    unsubscribeAuth,
    garmentOrders,
    getGarmentOrdersByVendor,
    getFilteredOrder,
    setInStates,
    init,
    orders,
  };
});
