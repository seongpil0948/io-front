import { MapKey, ShopUserGarment, VENDOR_GARMENT_DB } from "@/composable";
import { onBeforeUnmount, Ref, ref, watchEffect } from "vue";
import { ShopGarment, GarmentOrderCondi, SHOP_GARMENT_DB } from "..";

export function useShopUserGarments(
  userId: string,
  shopCondi: Ref<GarmentOrderCondi[]> | null
) {
  const userProd: Ref<ShopUserGarment[]> = ref([]);
  const rowIdField: MapKey = "shopProdId";
  const { shopProds, unsubscribe } = useShopGarments(userId, shopCondi);

  watchEffect(async () => {
    userProd.value = [];

    for (let i = 0; i < shopProds.value.length; i++) {
      const prod = shopProds.value[i];
      const vendorUnit = await VENDOR_GARMENT_DB.getByIdWithUser(
        prod.vendorProdId
      );
      if (!vendorUnit) continue;
      userProd.value.push(
        Object.assign(
          { userName: vendorUnit.userInfo.userName },
          vendorUnit,
          prod
        )
      );
    }
  });
  return { rowIdField, userProd, unsubscribe };
}

export function useShopGarments(
  userId: string,
  condi: Ref<GarmentOrderCondi[]> | null
) {
  const matching = (p: ShopGarment) =>
    condi && condi.value.length > 0
      ? condi.value.some(
          (x) =>
            x.color === p.color &&
            x.size === p.size &&
            x.prodName === p.prodName
        )
      : true;
  const { shopProds, unsubscribe } = SHOP_GARMENT_DB.useGetShopGarments(
    userId,
    matching
  );
  onBeforeUnmount(() => unsubscribe());

  return { shopProds, unsubscribe };
}
