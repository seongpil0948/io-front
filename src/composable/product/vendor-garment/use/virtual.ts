import {
  VendorProdSimilar,
  VendorProdSame,
  VendorGarment,
  onFirestoreCompletion,
  onFirestoreErr,
  ShopGarment,
} from "@/composable";
import { getIoCollection, IoUser } from "@io-boxies/js-lib";
import {
  createGarments,
  existSameProduct,
  getSimilarProducts,
} from "@/composable/product/vendor-garment/db/firebase";
import { ref, onBeforeUnmount } from "vue";
import { handleReadSnap } from "@/util";
import { onSnapshot, query, orderBy, where } from "firebase/firestore";
import { uuidv4 } from "@firebase/util";
import { shopProdC } from "../../shop-garment/db/firebase";

export function useVirtualVendorProd(user: IoUser) {
  const uid = user.userInfo.userId;
  const name = "VirtualVendorProd snapshot";

  // >>> virtual
  const virVendorProdC = getIoCollection({
    uid,
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
  ) => {
    await createGarments(virVendorProdC, userId, args);
    for (let i = 0; i < args.length; i++) {
      const virProd = args[i];
      if (virProd.vendorId !== userId) {
        throw new Error("virtual garment 생성 에러");
      }
      const shopProd = new ShopGarment({
        vendorId: virProd.vendorId,
        vendorProdId: virProd.vendorProdId,
        shopProdId: uuidv4(),
        shopId: uid,
        prodPrice: virProd.vendorPrice,
        prodName: virProd.vendorProdName,
        info: virProd.info,
        description: virProd.description,
        size: virProd.size,
        color: virProd.color,
        TBD: {},
        prodType: "GARMENT",
        visible: "ME",
      });
      await shopProd.update();
    }
  };

  const virVendorProds = ref<VendorGarment[]>([]);
  const unsubscribeVirtual = onSnapshot(
    query(virVendorProdC, orderBy("createdAt", "desc")),
    (snap) =>
      handleReadSnap<VendorGarment>(
        snap,
        virVendorProds.value,
        (x) => x.vendorProdId
      ),
    async (err) => {
      await onFirestoreErr(name, err);
      throw err;
    },
    () => onFirestoreCompletion(name)
  );
  const virShopProds = ref<ShopGarment[]>([]);
  const unsubscribeShopProd = onSnapshot(
    query(
      shopProdC,
      where("shopId", "==", uid),
      where("visible", "==", "ME"),
      orderBy("createdAt", "desc")
    ),
    (snap) =>
      handleReadSnap<ShopGarment>(
        snap,
        virShopProds.value,
        (x) => x.vendorProdId
      ),
    async (err) => {
      await onFirestoreErr(name, err);
      throw err;
    },
    () => onFirestoreCompletion(name)
  );
  onBeforeUnmount(() => {
    unsubscribeVirtual();
    unsubscribeShopProd();
  });
  return {
    virVendorProdC,
    getVirSimilarProds,
    existVirSameProd,
    createVirVendorGarments,
    virVendorProds,
    virShopProds,
  };
}
