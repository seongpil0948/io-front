/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  onFirestoreCompletion,
  onFirestoreErr,
  ShopGarment,
  ShopUserGarment,
  SHOP_GARMENT_DB,
  useVirtualVendor,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { defineStore } from "pinia";
import { ref, computed, Ref, watch, onBeforeMount } from "vue";
import { useAuthStore } from "./auth";
import {
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  where,
} from "@firebase/firestore";
import { logger } from "@/plugin/logger";
import { ioFireStore } from "@/plugin/firebase";
import {
  getIoCollection,
  getUserName,
  uniqueArr,
  USER_DB,
} from "@io-boxies/js-lib";
import { shopProdC } from "@/composable/product/shop-garment/db/firebase";
import { handleReadSnap } from "@/util";

export const useShopProdStore = defineStore("ShopProdStore", () => {
  logger.debug("=== called ShopProdStore ===");

  const authStore = useAuthStore();
  let shopGarmentUnSub: null | Unsubscribe = null;
  const { shopProds, unsubscribe } = SHOP_GARMENT_DB.useGetShopGarments(
    authStore.uid,
    () => true
  );

  const userProd: Ref<ShopUserGarment[]> = ref([]);
  const name = "VirtualVendorProd snapshot";
  const uid = authStore.currUser().userInfo.userId;
  const virVendorProdC = () =>
    getIoCollection(ioFireStore, {
      uid,
      c: "VIRTUAL_VENDOR_PROD",
    }).withConverter(VendorGarment.fireConverter());
  const { virtualVendors, virtualVendorById } = useVirtualVendor(uid);
  const virVendorProds = ref<VendorGarment[]>([]);
  const unsubscribeVirtual = onSnapshot(
    query(virVendorProdC(), orderBy("createdAt", "desc")),
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

  const userVirProds = computed(() => {
    return virShopProds.value.map((x) => {
      const u = virtualVendorById.value[x.vendorId] ?? authStore.currUser();
      return Object.assign(
        { userName: u.userInfo.userName },
        x,
        u
      ) as ShopUserGarment;
    });
  });

  const unsubscribeAuth = authStore.$onAction(
    ({ name, store, args, after, onError }) => {
      after(async () => {
        const u = store.user;
        if (name === "login") {
          if (!u) discard();
          else if (u.userInfo.role !== "SHOP") {
            discard();
          }
        } else if (name === "logout") {
          discard();
        }
      });
      onError((error) => {
        logger.error(store.user?.userInfo.userId, error);
        discard();
      });
    },
    true
  );

  const data = computed<ShopUserGarment[]>(() => {
    const arr: ShopUserGarment[] = [...userProd.value, ...userVirProds.value];
    return [...new Map(arr.map((item) => [item.shopProdId, item])).values()];
  });

  watch(
    () => shopProds.value,
    async (prods, prev) => {
      if (!prods || !prev || prods.length === prev.length) return;
      const userProds: typeof userProd.value = [];
      const vendorIds = uniqueArr(prods.map((x) => x.vendorId));
      const vendors = await USER_DB.getUserByIds(ioFireStore, vendorIds);
      const vendorProds = await VENDOR_GARMENT_DB.listByIds(
        prods.map((x) => x.vendorProdId)
      );

      for (let i = 0; i < prods.length; i++) {
        const prod = prods[i];
        const vendor = vendors.find((x) => prod.vendorId === x.userInfo.userId);
        const vendorProd = vendorProds.find(
          (y) => prod.vendorProdId === y.vendorProdId
        );
        if (!vendorProd || !vendor) continue;
        userProds.push(
          Object.assign(
            { userName: getUserName(vendor) },
            vendorProd,
            vendor,
            prod
          )
        );
      }
      userProd.value = userProds;
    }
  );

  function discard() {
    console.log(`=== discard ShopProdStore === `);
    if (shopGarmentUnSub) {
      shopGarmentUnSub();
      shopGarmentUnSub = null;
    }
    unsubscribeVirtual();
    unsubscribeShopProd();
    unsubscribe();
  }

  return {
    uid,
    unsubscribeAuth,
    virtualVendors,
    userVirProds,
    virtualVendorById,
    virShopProds,
    userProd,
    data,
    virVendorProdC,
    virVendorProds,
  };
});
