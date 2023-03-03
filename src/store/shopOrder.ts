/* eslint-disable @typescript-eslint/no-unused-vars */
import { extractGarmentOrd } from "@/util";
import {
  ORDER_GARMENT_DB,
  useShopUserProds,
  OrderItemCombined,
  OrderItemByVendor,
  ORDER_STATE,
  IoOrder,
  ShopUserGarment,
  useVirtualVendor,
  vendorUserProdFromOrders,
  Mapper,
} from "@/composable";
import { defineStore } from "pinia";
import { ref, computed, onBeforeUnmount, watchEffect } from "vue";
import { useAuthStore } from "./auth";
import { doc, onSnapshot, Unsubscribe } from "@firebase/firestore";
import { logger } from "@/plugin/logger";
import { ioFireStore } from "@/plugin/firebase";
import { getIoCollection } from "@io-boxies/js-lib";

// TODO: to shallow ref
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
  function getOrders(inStates: ORDER_STATE[]) {
    return computed(() =>
      _orders.value.filter((x) => x.states.some((y) => inStates.includes(y)))
    );
  }
  /**
   *  deprecated, it's not responsive
   */
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
  const uid = () => authStore.currUser().userInfo.userId;
  const { virtualVendors } = useVirtualVendor(uid());
  watchEffect(async () => {
    if (shopId.value && orders.value.length > 0 && shopProds.value.length > 0) {
      await setExistOrderIds();
      const vendorProds = await vendorUserProdFromOrders(
        orders.value.flatMap((o) => o.items),
        virtualVendors.value
      );
      _ioOrders.value = extractGarmentOrd(
        orders.value,
        shopProds.value,
        vendorProds
      );
    } else {
      _ioOrders.value = [];
      existOrderIds.value.clear();
    }
  });
  onBeforeUnmount(() => {
    inStates.value = [];
  });
  const mapper = ref<Mapper | null>(null);
  const mapperDoc = doc(
    getIoCollection(ioFireStore, { c: "MAPPER" }),
    uid()
  ).withConverter(Mapper.fireConverter());
  const mapUnsubscribe = onSnapshot(mapperDoc, (doc) => {
    mapper.value = doc.data() ?? Mapper.initialMapper(uid());
    console.log("snapshot mapper", mapper.value);
  });
  async function mapperUpdate() {
    console.log("called mapperUpdate ", mapper.value);
    mapper.value?.update().catch((err) => {
      const message = `업데이트 실패 ${
        err instanceof Error ? err.message : JSON.stringify(err)
      }`;
      logger.error(uid(), message, err);
    });
  }

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
    const { unsubscribe } = useShopUserProds({
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
    mapper.value = null;
    mapUnsubscribe();
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
    uid,
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
    virtualVendors,
    mapper,
    mapperUpdate,
  };
});
