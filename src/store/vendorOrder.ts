import {
  OrderItemByShop,
  IoOrder,
  SHOP_GARMENT_DB,
  ORDER_GARMENT_DB,
  ORDER_STATE,
  OrderItemCombined,
  ShopUserGarment,
  VendorUserOrderGarment,
  mergeOrderItem,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { uniqueArr, extractGarmentOrd } from "@/util";
import { Unsubscribe } from "@firebase/util";
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useAuthStore } from "./";

export const useVendorOrderStore = defineStore("vendorOrderStore", () => {
  console.log(`=== called useVendorOrderStore === `);
  // >>> state >>>
  const authStore = useAuthStore();
  const inStates = ref<ORDER_STATE[]>([]);
  const vendorId = ref<string | null>(null);
  const _orders = ref<IoOrder[]>([]);
  let orderUnSub: null | Unsubscribe = null;
  const shopProds = ref<ShopUserGarment[]>([]);
  const _ioOrders = ref<OrderItemCombined[]>([]);
  let initial = true;
  // >>> getter >>>
  const orders = computed(() => [..._orders.value]);

  const { items: prods, unsubscribe: garmentUnSub } =
    VENDOR_GARMENT_DB.batchReadListen([authStore.currUser.userInfo.userId]);
  const vendorProds = computed(() =>
    prods.value.map((prod) => Object.assign({}, prod, authStore.currUser))
  );

  function getVendorOrderGarments(orders: typeof _orders) {
    return computed<VendorUserOrderGarment[]>(
      () =>
        vendorProds.value
          .map((vendorProd) => {
            for (let i = 0; i < orders.value.length; i++) {
              const o = orders.value[i];
              for (let j = 0; j < o.items.length; j++) {
                const item = o.items[j];
                if (item.vendorProd.vendorProdId === vendorProd.vendorProdId) {
                  mergeOrderItem(vendorProd, item);
                }
              }
            }

            return vendorProd;
          })
          .filter((y) => y !== null) as VendorUserOrderGarment[]
    );
  }
  function getGarmentOrdersByShop(ioOrders: typeof _ioOrders) {
    return computed(() =>
      ioOrders.value.reduce((acc, curr) => {
        const exist = acc.find((x) => x.shopId === curr.shopProd.shopId);
        if (!exist) {
          acc.push({
            shopId: curr.shopProd.shopId,
            shopName:
              curr.shopProd.userInfo.displayName ??
              curr.shopProd.userInfo.userName,
            items: [curr],
          });
          return acc;
        }
        exist.items.push(curr);
        return acc;
      }, [] as OrderItemByShop[])
    );
  }
  function getOrders(inStates: ORDER_STATE[]) {
    return computed(() =>
      inStates.length > 0
        ? _orders.value.filter((x) =>
            x.states.some((y) => inStates.includes(y))
          )
        : _orders.value
    );
  }
  function getFilteredOrder(inStates: ORDER_STATE[]) {
    return computed(() =>
      inStates.length > 0
        ? _ioOrders.value.filter((x) => inStates.includes(x.state))
        : _ioOrders.value
    );
  }
  // >>> connection >>>
  const unsubscribeAuth = authStore.$onAction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ name, store, args, after, onError }) => {
      after(async () => {
        const u = store.user;
        if (name === "login") {
          if (!u) throw new Error("User is null");
          else if (u.userInfo.role === "VENDOR") {
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
    async function () {
      shopProds.value = [];
      const shopIds = uniqueArr(orders.value.map((x) => x.shopId));
      shopProds.value = await SHOP_GARMENT_DB.getBatchShopProds(shopIds);
      _ioOrders.value = extractGarmentOrd(
        orders.value,
        shopProds.value,
        vendorProds.value
      );
    },
    { deep: true, immediate: false }
  );

  // >>> action >>>
  function init(vendorUserId: string) {
    if (!initial || !vendorUserId || vendorUserId === vendorId.value) return;
    console.log(
      `=== init useVendorOrderStore === vendorUserId: ${vendorUserId}`
    );
    vendorId.value = vendorUserId;

    const { unsubscribe: orderUnsubscribe } = ORDER_GARMENT_DB.vendorReadListen(
      {
        vendorId: vendorUserId,
        orders: _orders,
      }
    );
    if (orderUnSub) {
      orderUnSub();
    }
    orderUnSub = orderUnsubscribe;
    initial = false;
  }
  function discard() {
    console.log(`=== discard useVendorOrderStore ===`);
    unsubscribeAuth();
    if (orderUnSub) {
      orderUnSub();
      orderUnSub = null;
      garmentUnSub();
    }
    shopProds.value = [];
    inStates.value = [];
    vendorId.value = null;
    _orders.value = [];
    _ioOrders.value = [];
    shopProds.value = [];
    initial = true;
  }
  return {
    getGarmentOrdersByShop,
    getOrders,
    getFilteredOrder,
    vendorProds,
    orders,
    init,
    discard,
    getVendorOrderGarments,
  };
});
