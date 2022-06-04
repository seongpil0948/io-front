import { vendorProdConverter, type VendorProd } from "@/composables";
import { IoCollection } from "@/types";
import {
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  where,
} from "firebase/firestore";
import { ref } from "vue";
import { getIoCollection } from "..";

export function getVendorProdById(vendorId: string) {
  const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
    vendorProdConverter
  );
  const prods = ref<VendorProd[]>([]);
  const subscribe = onSnapshot(
    query(c, where("vendorId", "==", vendorId), orderBy("vendorProdName")),
    (snapshot) => {
      prods.value = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data) {
          prods.value.push(data);
        }
      });
    }
  );

  return { prods, subscribe };
}

export async function getVendorProd(vendorId: string | null) {
  const constraints: QueryConstraint[] = [];
  const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
    vendorProdConverter
  );
  if (vendorId) {
    constraints.push(where("vendorId", "==", vendorId));
  }
  const prods: VendorProd[] = [];
  const snapshot = await getDocs(
    query(c, ...constraints, orderBy("vendorProdName"))
  );
  snapshot.docs.forEach((d) => {
    const data = d.data();
    if (data) {
      prods.push(data);
    }
  });
  return prods;
}
