import { useMessage } from "naive-ui";
import {
  catchExcelError,
  GARMENT_SIZE,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { useAuthStore } from "@/store";
import { readExcel, DataFrame, Series } from "danfojs";
import { ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
export function useBatchVendorProd() {
  const fileModel = ref<FileList | null>();
  const excelInputRef = ref<null | HTMLInputElement>(null);
  const authStore = useAuthStore();
  const u = authStore.currUser;
  const msg = useMessage();
  watch(
    () => fileModel.value,
    async (files) => {
      try {
        console.log("fileModel in  watch", files);
        if (files && files.length > 0) {
          const file = files[0];
          const inputDf = await readExcel(file);
          if (inputDf) {
            console.log("inputDf: ", inputDf);
            const vendorGarments = parseDf(inputDf as DataFrame);
            await VENDOR_GARMENT_DB.batchCreate(vendorGarments);
            msg.success(`${vendorGarments.length}건 추가완료`);
          }
        }
      } catch (err) {
        catchExcelError({ err });
      }
    }
  );

  function parseDf(df: DataFrame) {
    console.log("df.columns: ", df.columns);
    const vendorGarments: VendorGarment[] = [];
    df.apply((row: Series) => {
      const vendorProdName = row[0];
      const vendorPrice = row[5];
      const color = row[1];
      const sizeStr = String(row[2]);
      const size: GARMENT_SIZE = Object.keys(GARMENT_SIZE).includes(sizeStr)
        ? (sizeStr as GARMENT_SIZE)
        : "FREE";
      vendorGarments.push(
        new VendorGarment({
          gender: "UNISEX",
          part: "ETC",
          ctgr: "",
          color,
          allowPending: false,
          size,
          fabric: "",
          vendorId: u.userInfo.userId,
          vendorProdId: uuidv4(),
          vendorPrice,
          stockCnt: parseInt(row[9]),
          vendorProdName,
          titleImgs: [],
          bodyImgs: [],
          info: "",
          description: "",
        })
      );
      return row;
    });

    console.log("vendorGarments:", vendorGarments);
    vendorGarments.pop();
    return vendorGarments;
  }

  function onBtnClick() {
    if (excelInputRef.value) {
      excelInputRef.value.click();
    }
  }

  return { fileModel, excelInputRef, onBtnClick };
}
