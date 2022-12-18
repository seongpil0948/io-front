import { VendorProdSimilar, VendorProdSame, VendorGarment } from "@/composable";
import { getIoCollection } from "@io-boxies/js-lib";
import {
  createGarments,
  existSameProduct,
  getSimilarProducts,
} from "@/composable/product/vendor-garment/db/firebase";
import { Ref, shallowRef } from "vue";
import { getDocs } from "@firebase/firestore";

export function useVirtualVendorProd(uid: Ref<string>) {
  // >>> virtual
  const virVendorProdC = getIoCollection({
    uid: uid.value,
    c: "VIRTUAL_VENDOR_PROD",
  }).withConverter(VendorGarment.fireConverter());

  const getVirSimilarProds = async (
    d: VendorProdSimilar
  ): Promise<VendorGarment[]> => getSimilarProducts(virVendorProdC, d);
  const existVirSameProd = async (d: VendorProdSame): Promise<boolean> =>
    existSameProduct(virVendorProdC, d);
  const createVirVendorGarments = async (
    userId: string,
    args: VendorGarment[]
  ) => createGarments(virVendorProdC, userId, args);
  const virProds = shallowRef<VendorGarment[]>([]);
  async function getVirProds() {
    const docSnap = await getDocs(virVendorProdC);
    virProds.value = docSnap.docs
      .map((x) => x.data())
      .filter((x) => x !== null) as VendorGarment[];
  }

  return {
    virVendorProdC,
    getVirSimilarProds,
    existVirSameProd,
    createVirVendorGarments,
    getVirProds,
    virProds,
  };
}
