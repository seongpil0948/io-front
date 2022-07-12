import { useShopStore } from "@/stores/shops";
import {
  getVendorGroupOrderInfo,
  scribeVendorProdById,
} from "@/plugins/firebase";
import { VendorOrderParam, VendorUserOrderProd } from "@/types";
import { ref, watch } from "vue";
import { ShopReqOrder } from "@/composables";

export function useReadVendorOrderInfo(p: VendorOrderParam) {
  const { prods } = scribeVendorProdById(p.vendorId);
  const { orders } = getVendorGroupOrderInfo(p);
  const shopStore = useShopStore();
  const orderProds = ref<VendorUserOrderProd[]>([]);

  async function refreshData() {
    orderProds.value = [];
    for (let j = 0; j < prods.value.length; j++) {
      const prod = prods.value[j];
      const order = orders.value.find(
        (ord) => prod.vendorProdId === ord.vendorProdId
      );
      if (!order) {
        orderProds.value.push(
          Object.assign(
            {
              shopUser: undefined,
              unPaidAmount: 0,
              userName: "",
            },
            prod,
            ShopReqOrder.none()
          )
        );
        continue;
      }
      const exist = orderProds.value.find(
        (z) =>
          z.shopId === order.shopId && z.vendorProdId === order.vendorProdId
      );
      const shopUser = await shopStore.getShop(order.shopId);
      if (exist) {
        exist.amount += order.amount;
        exist.pendingCnt += order.pendingCnt;
        exist.orderCnt += order.orderCnt;
      } else {
        orderProds.value.push(
          Object.assign(
            {
              shopUser,
              unPaidAmount: 0,
              userName: shopUser!.userInfo.userName,
            },
            prod,
            order
          )
        );
      }
    }
  }
  watch(
    () => prods,
    async function () {
      console.log("watch prods: ");
      await refreshData();
    },
    { deep: true }
  );
  watch(
    () => orders,
    async function () {
      console.log("watch orders: ");
      await refreshData();
    },
    { deep: true }
  );

  return { prods, orders, orderProds };
}
