import { ShopReqOrder, shopReqOrderConverter } from "@/composables";
import { getIoCollectionGroup } from "@/plugins/firebase";
import { VendorOrderParam, IoCollection } from "@/types";
import { where, query, onSnapshot } from "@firebase/firestore";
import { ref } from "vue";

export function getVendorGroupOrderInfo(p: VendorOrderParam) {
  const constraints = [where("vendorId", "==", p.vendorId)];
  if (p.inStates && p.inStates.length > 0) {
    constraints.push(where("orderState", "in", p.inStates));
  }
  if (p.notStates && p.notStates.length > 0) {
    constraints.push(where("orderState", "not-in", p.notStates));
  }

  const orders = ref<ShopReqOrder[]>([]);
  const orderQ = query(
    getIoCollectionGroup(IoCollection.SHOP_REQ_ORDER).withConverter(
      shopReqOrderConverter
    ),
    ...constraints
  );
  const subscribe = onSnapshot(orderQ, (snapshot) => {
    orders.value = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        orders.value.push(data);
      }
    });
  });

  return { subscribe, orders };
}
