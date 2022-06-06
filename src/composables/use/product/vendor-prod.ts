import { useVendorsStore } from "@/stores";
import {
  getVendorGroupOrderInfo,
  scribeVendorProdById,
} from "@/plugins/firebase";
import { computed, onBeforeMount } from "vue";
import { VendorOrderProd } from "@/types";

export function useVendors() {
  const vendorStore = useVendorsStore();
  onBeforeMount(async () => {
    if (vendorStore.isInitial) {
      await Promise.all([
        vendorStore.getVendorProducts(),
        vendorStore.getVendors(),
      ]);
    }
  });
  return { vendorStore };
}

export function useVendor(vendorId: string) {
  const { prods } = scribeVendorProdById(vendorId);
  const { orders } = getVendorGroupOrderInfo({ vendorId });
  const orderProds = computed<VendorOrderProd[]>(() => {
    const ps: VendorOrderProd[] = [];
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
        }, {} as VendorOrderProd);
        ps.push(Object.assign({}, p, order));
      }
    });
    return ps;
  });

  return { prods, orders, orderProds };
}
