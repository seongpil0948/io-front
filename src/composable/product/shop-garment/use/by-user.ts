import { MapperFields, UserShopGarment } from "@/composable";
import { useVendorsStore } from "@/store";
import { Ref, ref, watchEffect } from "vue";
import { ShopGarment, ShopGarmentQField, useGetShopGarments } from "..";

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
  const { shopProds } = useGetShopGarments(userId, matching);

  return { shopProds };
}

export function useUserShopGarment(
  userId: string,
  shopCondi: Ref<ShopGarmentQField[]> | null
) {
  const userProd: Ref<UserShopGarment[]> = ref([]);
  const rowIdField: keyof MapperFields = "shopProdId";
  const { shopProds } = useShopGarments(userId, shopCondi);
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
  return { rowIdField, userProd };
}
