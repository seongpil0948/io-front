import { shopReqOrderConverter } from "../../../composables/model/order-info";
import { IoCollection, ORDER_STATE } from "@/types";
import type { ShopReqOrder } from "@/composables";
import { getIoCollectionGroup, iostore } from "@/plugins/firebase";
import {
  collectionGroup,
  getDocs,
  onSnapshot,
  query,
  QueryConstraint,
  where,
} from "firebase/firestore";
import type { Ref } from "vue";

export async function getVendorGroupOrderInfo(
  vendorId: string,
  states: ORDER_STATE[]
) {
  const orders: ShopReqOrder[] = [];
  const orderQ = query(
    getIoCollectionGroup(IoCollection.SHOP_REQ_ORDER).withConverter(
      shopReqOrderConverter
    ),
    where("vendorId", "==", vendorId),
    where("orderState", "in", states)
  );
  const querySnapshot = await getDocs(orderQ);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data) {
      orders.push(data);
    }
  });
  return orders;
}

export function getShopOrderInfo(
  orders: Ref<ShopReqOrder[]>,
  shopId: string,
  orderStates: ORDER_STATE[]
) {
  const constraints: QueryConstraint[] = [];
  orderStates.forEach((state) => {
    constraints.push(where("orderState", "==", state));
  });
  const q = query(
    collectionGroup(iostore, "orderProducts").withConverter(
      shopReqOrderConverter
    ),
    ...constraints
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    orders.value = [];
    snapshot.forEach((s) => {
      const data = s.data();
      if (data) {
        orders.value.push(data);
      }
    });
  });
  return { unsubscribe };
}
