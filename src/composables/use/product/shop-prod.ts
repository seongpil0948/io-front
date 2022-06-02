import { watchEffect, type Ref, ref } from "vue";
import type { ShopProdQField, MapperFields, ShopUserProd } from "@/types";
import { useGetShopProds } from "@/plugins/firebase";
import { useVendors } from "./vendor-prod";
import type { ShopProd } from "@/composables/model";

export function useShopProds(
  userId: string,
  condi: Ref<ShopProdQField[]> | null
) {
  const matching = (p: ShopProd) =>
    condi && condi.value.length > 0
      ? condi.value.some(
          (x) =>
            x.color === p.color &&
            x.size === p.size &&
            x.prodName === p.prodName
        )
      : true;
  const { shopProds } = useGetShopProds(userId, matching);

  return { shopProds };
}

export function useShopUserProds(
  userId: string,
  shopCondi: Ref<ShopProdQField[]> | null
) {
  const userProd: Ref<ShopUserProd[]> = ref([]);
  const rowIdField: keyof MapperFields = "shopProdId";
  const { shopProds } = useShopProds(userId, shopCondi);
  const { vendorStore } = useVendors();

  watchEffect(() => {
    userProd.value = [];
    vendorStore.vendorUserProds.forEach((vendorUnit) => {
      const prod = shopProds.value.find((p) => p.isSameWithVendor(vendorUnit));
      if (!prod) return;
      userProd.value.push(Object.assign({}, vendorUnit, prod));
    });
  });
  return { rowIdField, userProd };
}
