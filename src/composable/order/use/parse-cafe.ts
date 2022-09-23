import {
  GarmentOrderCondi,
  useShopUserGarments,
  Mapper,
  garmentOrderFromCondi,
  CafeOrder,
  mapCafeOrder,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { useVendorsStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { Ref, ref } from "vue";

export function useOrderParseCafe(
  mapper: Ref<Mapper | null>,
  userId: string,
  existIds: Ref<Set<string>>
) {
  const conditions = ref<GarmentOrderCondi[]>([]);
  const vendorStore = useVendorsStore();
  const { userProd } = useShopUserGarments(userId, conditions);
  const msg = useMessage();

  function parseCafeOrder(cafeOrders: CafeOrder[]) {
    conditions.value = [];
    const reporter = [] as any[];
    if (!mapper.value) return;

    for (let i = 0; i < cafeOrders.length; i++) {
      const cafeOrd = cafeOrders[i];
      try {
        const condi = mapCafeOrder(cafeOrd, mapper.value, existIds.value);
        conditions.value = [...conditions.value, ...condi];
      } catch (err) {
        if (err instanceof Error) {
          reporter.push(err.message);
        } else {
          throw err;
        }
      }
    }
    reporter.forEach((err) => {
      msg.error(err, makeMsgOpt({ duration: 20000 }));
      logger.error(userId, err);
    });

    return garmentOrderFromCondi(
      conditions.value,
      vendorStore.vendorUserGarments,
      userProd.value
    );
  }

  return { parseCafeOrder, conditions };
}
