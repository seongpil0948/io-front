import { MapKey, ShopUserGarment } from "@/composable";
import { USER_DB } from "@io-boxies/js-lib";
import { onBeforeUnmount, Ref, ref, watchEffect, watch } from "vue";
import { ShopGarment, GarmentOrderCondi, SHOP_GARMENT_DB } from "..";

export function useShopUserGarments(d: {
  shopId: string;
  shopCondi?: Ref<GarmentOrderCondi[]>;
  onChanged?: (prods: ShopUserGarment[]) => Promise<void> | void;
}) {
  const userProd: Ref<ShopUserGarment[]> = ref([]);
  const rowIdField: MapKey = "shopProdId";
  const { shopProds, unsubscribe } = useShopGarments(
    d.shopId,
    d.shopCondi ?? null
  );

  watchEffect(async () => {
    const userProds: typeof userProd.value = [];
    const shop = await USER_DB.getUserById(d.shopId);
    if (!shop) return;
    for (let i = 0; i < shopProds.value.length; i++) {
      const prod = shopProds.value[i];
      userProds.push(Object.assign(shop, prod));
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
