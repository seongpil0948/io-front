import {
  MapKey,
  ShopUserGarment,
  VENDOR_GARMENT_DB,
  getUserName,
  USER_DB,
} from "@/composable";
import { onBeforeUnmount, Ref, ref, watchEffect, watch } from "vue";
import { ShopGarment, MatchGarment, SHOP_GARMENT_DB } from "..";
import { ioFireStore } from "@/plugin/firebase";
import { uniqueArr } from "@/util";

export function useShopUserProds(d: GetShopProdParam) {
  const { shopProds, unsubscribe, rowIdField, userProd } = base(d);

  watchEffect(async () => {
    const userProds: typeof userProd.value = [];
    const shop = await USER_DB.getUserById(ioFireStore, d.shopId);
    if (!shop) return;
    for (let i = 0; i < shopProds.value.length; i++) {
      const prod = shopProds.value[i];
      userProds.push(Object.assign({}, shop, prod));
    }
    userProd.value = userProds;
  });

  if (d.onChanged) {
    watch(
      () => userProd.value,
      async (prods) => {
        if (d.onChanged) {
          d.onChanged(prods);
        }
      }
    );
  }

  return { rowIdField, userProd, unsubscribe };
}
export function useShopVendorUnits(d: GetShopProdParam) {
  const { shopProds, unsubscribe, rowIdField, userProd } = base(d);

  watch(
    () => shopProds.value,
    async (prods, prev) => {
      if (prods.length === prev.length) return;
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
      console.log("zz shopProds: ", prods, "userProd: ", userProds);
      userProd.value = userProds;
    }
  );

  if (d.onChanged) {
    watch(
      () => userProd.value,
      async (prods) => {
        if (d.onChanged) {
          d.onChanged(prods);
        }
      }
    );
  }

  return { rowIdField, userProd, unsubscribe, shopProds };
}

const base = (d: GetShopProdParam) => {
  const userProd: Ref<ShopUserGarment[]> = ref([]);
  const rowIdField: MapKey = "shopProdId";
  const zz = useShopGarments(d);
  return {
    userProd,
    rowIdField,
    ...zz,
  };
};

export function useShopGarments(d: GetShopProdParam) {
  const matching = (p: ShopGarment) =>
    d.shopCondi && d.shopCondi.value.length > 0
      ? d.shopCondi.value.some(
          (x) =>
            x.color === p.color &&
            x.size === p.size &&
            x.prodName === p.prodName
        )
      : true;
  const { shopProds, unsubscribe } = SHOP_GARMENT_DB.useGetShopGarments(
    d.shopId,
    matching
  );
  onBeforeUnmount(() => unsubscribe());

  return { shopProds, unsubscribe };
}

interface GetShopProdParam {
  shopId: string;
  shopCondi?: Ref<MatchGarment[]>;
  onChanged?: (prods: ShopUserGarment[]) => Promise<void> | void;
}
