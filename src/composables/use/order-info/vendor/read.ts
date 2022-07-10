import { useShopStore } from "@/stores/shops";
import { logger } from "@/plugins/logger";
import {
  getVendorGroupOrderInfo,
  scribeVendorProdById,
} from "@/plugins/firebase";
import { VendorOrderParam, VendorUserOrderProd } from "@/types";
import { computed, watchEffect, ref } from "vue";

export function useReadVendorOrderInfo(p: VendorOrderParam) {
  const { prods } = scribeVendorProdById(p.vendorId);
  const { orders } = getVendorGroupOrderInfo(p);
  const shopStore = useShopStore();
  const ordProds = ref<VendorUserOrderProd[]>([]);

  watchEffect(async () => {
    ordProds.value = [];
    for (let i = 0; i < orders.value.length; i++) {
      const ord = orders.value[i];
      const shopUser = await shopStore.getShop(ord.shopId);
      if (!shopUser) {
        logger.error(null, "There is no shopUser for order: ", ord.orderId);
        continue;
      }
      const prod = prods.value.find((y) => y.vendorProdId === ord.vendorProdId);
      if (!prod) {
        logger.error(null, "There is no product for order: ", ord.orderId);
        continue;
      }
      const exist = ordProds.value.find(
        (z) => z.shopId === ord.shopId && z.vendorProdId === ord.vendorProdId
      );
      if (exist) {
        exist.amount += ord.amount;
        exist.pendingCnt += ord.pendingCnt;
        exist.orderCnt += ord.orderCnt;
      } else {
        ordProds.value.push(
          Object.assign(
            { shopUser, unPaidAmount: 0, userName: shopUser.userInfo.userName },
            prod,
            ord
          )
        );
      }
    }
  });
  const orderProds = computed<VendorUserOrderProd[]>(() =>
    p.orderExist ? ordProds.value.filter((x) => x.orderCnt > 0) : ordProds.value
  );

  return { prods, orders, orderProds };
}
