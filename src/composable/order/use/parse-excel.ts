import {
  GarmentOrderCondi,
  useShopUserGarments,
  Mapper,
  mapDfToOrder,
  GarmentOrder,
  garmentOrderFromCondi,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { useVendorsStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { readExcel, DataFrame } from "danfojs";
import { useMessage } from "naive-ui";
import { Ref, ref, watch } from "vue";

export function useOrderParseExcel(
  mapper: Ref<Mapper | null>,
  userId: string,
  fs: Ref<File[]>,
  existIds: Ref<Set<string>>,
  onParse: (orders: GarmentOrder[]) => void,
  sheetIdx: Ref<number>,
  startRow: Ref<number>
) {
  const conditions = ref<GarmentOrderCondi[]>([]);
  const vendorStore = useVendorsStore();
  const { userProd } = useShopUserGarments(userId, conditions);
  const msg = useMessage();

  watch(
    () => fs.value,
    async (files) => {
      if (!mapper.value) return;
      conditions.value = [];
      for (let i = 0; i < files.length; i++) {
        const inputDf = (await readExcel(files[i], {
          sheet: sheetIdx.value,
        })) as DataFrame;
        if (!inputDf) {
          const message = `파일: ${files[i].name}에 대한 처리에 실패 하였습니다.`;
          msg.error(message, makeMsgOpt());
          logger.error(userId, message);
          continue;
        }
        if (startRow.value > 0) {
          // console.log("readExcel: ", inputDf);
          const newDf = inputDf.iloc({ rows: [`${startRow.value}:`] });
          newDf.$setColumnNames(
            inputDf.iloc({ rows: [`${startRow.value - 1}:${startRow.value}`] })
              .values[0] as string[]
          );
          conditions.value.push(
            ...mapDfToOrder(newDf, mapper.value, existIds.value, userId, msg)
          );
        } else {
          conditions.value.push(
            ...mapDfToOrder(inputDf, mapper.value, existIds.value, userId, msg)
          );
        }
      }
      files = [];
      const ords = garmentOrderFromCondi(
        conditions.value,
        vendorStore.vendorUserGarments,
        userProd.value
      );

      onParse(ords);
    }
  );

  return { conditions, userProd };
}
