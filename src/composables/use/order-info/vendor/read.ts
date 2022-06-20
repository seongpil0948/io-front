import { ShopReqOrder } from "@/composables/model";
import {
  getVendorGroupOrderInfo,
  scribeVendorProdById,
} from "@/plugins/firebase";
import { ORDER_STATE, VendorUserOrderProd } from "@/types";
import { computed } from "vue";

export function useReadVendorOrderInfo(
  vendorId: string,
  orderStates: ORDER_STATE[]
) {
  const { prods } = scribeVendorProdById(vendorId);
  const { orders } = getVendorGroupOrderInfo({
    vendorId,
    inStates: orderStates,
  });
  const orderProds = computed<VendorUserOrderProd[]>(() => {
    const ps: VendorUserOrderProd[] = [];
    prods.value.forEach((p) => {
      const ords = orders.value.filter(
        (o) => o.vendorProdId === p.vendorProdId
      );
      if (ords.length > 0) {
        const order = ords.reduce((acc, curr, idx) => {
          if (idx === 0) {
            acc = curr;
          } else {
            acc.amount += curr.amount;
            acc.pendingCnt += curr.pendingCnt;
            acc.orderCnt += curr.orderCnt;
          }
          return acc;
        }, {} as VendorUserOrderProd);
        ps.push(Object.assign({ unPaidAmount: order.unPaidAmount }, p, order));
      } else {
        ps.push(Object.assign({ unPaidAmount: 0 }, ShopReqOrder.none(), p));
      }
    });
    return ps.filter((x) => x.orderCnt > 0);
  });

  return { prods, orders, orderProds };
}
