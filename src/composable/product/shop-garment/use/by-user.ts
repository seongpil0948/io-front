import { MapKey, ShopUserGarment, VENDOR_GARMENT_DB } from "@/composable";
import { USER_DB } from "@io-boxies/js-lib";
import { onBeforeUnmount, Ref, ref, watchEffect, watch } from "vue";
import { ShopGarment, MatchGarment, SHOP_GARMENT_DB } from "..";
import { ioFireStore } from "@/plugin/firebase";

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

  watchEffect(async () => {
    const userProds: typeof userProd.value = [];

    for (let i = 0; i < shopProds.value.length; i++) {
      const prod = shopProds.value[i];
      const vendorUnit = await VENDOR_GARMENT_DB.getByIdWithUser(
        prod.vendorProdId
      );
      if (!vendorUnit) continue;
      userProds.push(
        Object.assign(
          { userName: vendorUnit.userInfo.userName },
          vendorUnit,
          prod
        )
      );
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
