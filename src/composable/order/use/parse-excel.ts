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
        const file = files[i];
        const errMsg = `파일: ${file.name}에 대한 처리에 실패 하였습니다.`;
        try {
          const inputDf = (await readExcel(file, {
            sheet: sheetIdx.value,
          })) as DataFrame;
          if (!inputDf) {
            msg.error(errMsg, makeMsgOpt());
            logger.error(userId, errMsg);
            continue;
          }
          if (startRow.value > 0) {
            // console.log("readExcel: ", inputDf);
            const newDf = inputDf.iloc({
              rows: [`${startRow.value}:`],
            });
            newDf.$setColumnNames(
              inputDf.iloc({
                rows: [`${startRow.value - 1}:${startRow.value}`],
              }).values[0] as string[]
            );
            conditions.value.push(
              ...mapDfToOrder(newDf, mapper.value, existIds.value, userId, msg)
            );
          } else {
            conditions.value.push(
              ...mapDfToOrder(
                inputDf,
                mapper.value,
                existIds.value,
                userId,
                msg
              )
            );
          }
        } catch (err) {
          let m =
            errMsg + (err instanceof Error ? err.message : JSON.stringify(err));
          if (m.includes("password-protected")) {
            m = errMsg + "엑셀파일에 비밀번호가 있습니다. ";
          }
          msg.error(m, makeMsgOpt());
          logger.error(userId, m);
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
