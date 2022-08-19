import { MapKey, ShopUserGarment } from "@/composable";
import { useVendorsStore } from "@/store";
import { Ref, ref, watchEffect } from "vue";
import { ShopGarment, ShopGarmentQField, useGetShopGarments } from "..";

export function useShopUserGarments(
  userId: string,
  shopCondi: Ref<ShopGarmentQField[]> | null
) {
  const userProd: Ref<ShopUserGarment[]> = ref([]);
  const rowIdField: MapKey = "shopProdId";
  const { shopProds, unsubscribe } = useShopGarments(userId, shopCondi);
  const vendorStore = useVendorsStore();
  watchEffect(() => {
    userProd.value = [];
    vendorStore.vendorUserGarments.forEach((vendorUnit) => {
      const prod = shopProds.value.find((p) => p.isSameWithVendor(vendorUnit));
      if (!prod) return;
      else if (vendorUnit.userInfo) {
        userProd.value.push(
          Object.assign(
            { userName: vendorUnit.userInfo.userName },
            vendorUnit,
            prod
          )
        );
      } else {
        userProd.value.push(Object.assign({}, vendorUnit, prod));
      }
    });
  });
  return { rowIdField, userProd, unsubscribe };
}

export function useShopGarments(
  userId: string,
  condi: Ref<ShopGarmentQField[]> | null
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
  const { shopProds, unsubscribe } = useGetShopGarments(userId, matching);

  return { shopProds, unsubscribe };
}
