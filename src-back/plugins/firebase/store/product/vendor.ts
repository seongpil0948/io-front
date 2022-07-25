import { vendorProdConverter, VendorProd } from "@/composables";
import { IoCollection } from "@/types";
import {
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  where,
  writeBatch,
} from "firebase/firestore";
import { ref } from "vue";
import { getIoCollection, getIoStore } from "..";

export async function getVendorProdById(vendorProdId: string) {
  const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
    vendorProdConverter
  );
  const d = await getDoc(doc(c, vendorProdId));
  const data = d.data();
  return data ? VendorProd.fromJson(data) : null;
}

export function scribeVendorProdById(vendorId: string) {
  const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
    vendorProdConverter
  );
  const prods = ref<VendorProd[]>([]);
  const subscribe = onSnapshot(
    query(c, where("vendorId", "==", vendorId), orderBy("createdAt", "desc")),
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

export async function vendorProdsModify(prods: VendorProd[]) {
  const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
    vendorProdConverter
  );
  const batch = writeBatch(getIoStore());
  for (let i = 0; i < prods.length; i++) {
    const prod = prods[i];
    batch.update(doc(c, prod.vendorProdId), prod.toJson());
  }
  await batch.commit();
}
