import { useMessage } from "naive-ui";
import {
  catchError,
  catchExcelError,
  GARMENT_SIZE,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { useAuthStore, useCommonStore, useVendorsStore } from "@/store";
import { readExcel, DataFrame, Series } from "danfojs";
import { ref, watch } from "vue";
import { uuidv4 } from "@firebase/util";
import { useRouter } from "vue-router";
import { makeMsgOpt } from "@/util";

export function useBatchVendorProd() {
  const fileModel = ref<FileList | null>();
  const excelInputRef = ref<null | HTMLInputElement>(null);
  const authStore = useAuthStore();
  const u = authStore.currUser;
  const msg = useMessage();
  const router = useRouter();

  const disableModalSave = ref(false);
  const openPreviewModal = ref(false);
  const parsedGarments = ref<VendorGarment[]>([]);
  const cs = useCommonStore();
  async function onPreviewConfirm() {
    disableModalSave.value = true;
    if (parsedGarments.value.length < 1) {
      return msg.error("상품이 없습니다.");
    }
    cs.$patch({ showSpin: true });
    await VENDOR_GARMENT_DB.batchCreate(u.userInfo.userId, parsedGarments.value)
      .then(() => {
        msg.success(`${parsedGarments.value.length}건 추가완료`);
        parsedGarments.value = [];
        openPreviewModal.value = false;
        router.replace({ name: "VendorProductList" });
      })
      .catch((err) =>
        catchError({
          userId: u.userInfo.userId,
          err,
          opt: makeMsgOpt(),
          prefix: "상품등록 실패",
          msg,
        })
      )
      .finally(() => cs.$patch({ showSpin: false }));
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
  const { vendorProds: existGarments } = useVendorsStore();
  function parseDf(df: DataFrame) {
    // console.log("df.columns: ", df.columns);
    const vendorProds: VendorGarment[] = [];
    df.apply((row: Series) => {
      const vendorProdName = String(row[0]);
      const vendorPrice = row[5];
      const color = row[1];
      const sizeStr = String(row[2]);
      const size: GARMENT_SIZE = Object.keys(GARMENT_SIZE).includes(sizeStr)
        ? (sizeStr as GARMENT_SIZE)
        : "FREE";
      const newGarment = new VendorGarment({
        gender: "UNISEX",
        part: "ETC",
        ctgr: "ETC",
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
        vendorProdPkgId: "",
        TBD: {},
      });
      const exist = [...existGarments, ...vendorProds].find(
        (x) => x.combineId === newGarment.combineId
      );
      newGarment.vendorProdPkgId = exist ? exist.vendorProdPkgId : uuidv4();

      vendorProds.push(newGarment);
      return row;
    });

    console.log("vendorProds:", vendorProds);
    vendorProds.pop();
    return vendorProds;
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
    disableModalSave,
  };
}
