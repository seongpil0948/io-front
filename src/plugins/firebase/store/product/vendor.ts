import { vendorProdConverter, type VendorProd } from "@/composables";
import { IoCollection } from "@/types";
import {
  getDocs,
  orderBy,
  query,
  QueryConstraint,
  where,
} from "firebase/firestore";
import { getIoCollection } from "..";

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
