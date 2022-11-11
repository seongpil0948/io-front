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
import { useRouter } from "vue-router";

export function useBatchVendorProd() {
  const fileModel = ref<FileList | null>();
  const excelInputRef = ref<null | HTMLInputElement>(null);
  const authStore = useAuthStore();
  const u = authStore.currUser;
  const msg = useMessage();
  const router = useRouter();

  const openPreviewModal = ref(false);
  const parsedGarments = ref<VendorGarment[]>([]);
  async function onPreviewConfirm() {
    if (parsedGarments.value.length < 1) {
      return msg.error("상품이 없습니다.");
    }
    await VENDOR_GARMENT_DB.batchCreate(parsedGarments.value);
    msg.success(`${parsedGarments.value.length}건 추가완료`);
    parsedGarments.value = [];
    openPreviewModal.value = false;
    router.replace({ name: "VendorProductList" });
  }
  async function onPreviewCancel() {
    parsedGarments.value = [];
    openPreviewModal.value = false;
  }

  watch(
    () => fileModel.value,
    async (files) => {
      try {
        if (files && files.length > 0) {
          const file = files[0];
          const inputDf = await readExcel(file);
          if (inputDf) {
            parsedGarments.value = parseDf(inputDf as DataFrame);
            if (parsedGarments.value.length < 1) {
              return msg.warning("상품이 없습니다.");
            }
            openPreviewModal.value = true;
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

  return {
    fileModel,
    excelInputRef,
    onBtnClick,
    openPreviewModal,
    parsedGarments,
    onPreviewConfirm,
    onPreviewCancel,
  };
}
