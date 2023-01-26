import { useMessage } from "naive-ui";
import {
  catchError,
  catchExcelError,
  PRODUCT_SIZE,
  useFileReader,
  VendorGarment,
  VENDOR_GARMENT_DB,
  VISIBILITY,
} from "@/composable";
import { useAuthStore, useCommonStore } from "@/store";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { makeMsgOpt } from "@/util";
import { readExcelIo } from "@/plugin/xlsx";
import { utils } from "xlsx";
import { useLogger } from "vue-logger-plugin";

export function useBatchVendorProd(d: { visible: VISIBILITY }) {
  const excelInputRef = ref<null | HTMLInputElement>(null);
  const authStore = useAuthStore();
  const u = authStore.currUser;
  const msg = useMessage();
  const router = useRouter();
  const disableModalSave = ref(false);
  const openPreviewModal = ref(false);
  const parsedGarments = ref<VendorGarment[]>([]);
  const cs = useCommonStore();
  const log = useLogger();

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
          uid: u.userInfo.userId,
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

  const { progress, handleFileChange: handleFChange } = useFileReader({
    inputRef: excelInputRef,
    readMethod: "binary",
    onLoad: async (event) => {
      const vendorId = u.userInfo.userId;
      try {
        const result = event.target?.result;
        const workBook = readExcelIo(result, msg);
        for (let i = 0; i < Object.keys(workBook.Sheets).length; i++) {
          const sheetName = Object.keys(workBook.Sheets)[i];
          const sheet = workBook.Sheets[sheetName];
          // dataSlice(sheet, 0);
          const defval = "";
          const json = utils.sheet_to_json(sheet, { defval });
          console.log(`<<< after sheet: `, sheet, "json: ", json, " <<<");

          for (let z = 0; z < json.length; z++) {
            const j: any = json[z];
            const getNum = (k: string) =>
              Number.parseInt(String(j[k]).replace(/\D/g, ""));
            const getStr = (k: string) => String(j[k]).trim();

            const vendorProdName = getStr("품명");
            const vendorPrice = getNum("도매가");
            let primePrice = getNum("제품원가");
            if (primePrice < 10) {
              primePrice = vendorPrice;
            }
            const stockCnt = getNum("현재고");
            const color = getStr("칼라");
            const sizeStr = getStr("사이즈");
            if (
              vendorProdName.length < 1 &&
              color.length < 1 &&
              sizeStr.length < 1
            )
              continue;
            const size: PRODUCT_SIZE = Object.keys(PRODUCT_SIZE).includes(
              sizeStr
            )
              ? (sizeStr as PRODUCT_SIZE)
              : "FREE";
            console.log(
              `vendorProdName(${vendorProdName}), vendorPrice(${vendorPrice}), primePrice(${primePrice}), stockCnt(${stockCnt}), color(${color}), size(${size})`
            );
            const newGarment = new VendorGarment({
              gender: "UNISEX",
              part: "ETC",
              ctgr: "ETC",
              color,
              allowPending: false,
              size,
              fabric: "",
              vendorId,
              vendorProdId: "",
              vendorPrice,
              primeCost: primePrice,
              stockCnt: stockCnt,
              vendorProdName,
              titleImgs: [],
              bodyImgs: [],
              info: "",
              description: "",
              vendorProdPkgId: "",
              TBD: {},
              prodType: "GARMENT",
              ...d,
            });
            newGarment.vendorProdId = newGarment.uid;
            newGarment.vendorProdPkgId = newGarment.pkgUid;
            if (
              (await VENDOR_GARMENT_DB.existSameProd({
                vendorId,
                vendorProdName,
                color,
                size,
              })) ||
              parsedGarments.value.find(
                (x) => x.vendorProdId === newGarment.uid
              )
            ) {
              const message = `${vendorProdName}_${color}_${size}는 이미존재하는 상품 입니다.`;
              msg.warning(message, makeMsgOpt());
              log.warn(vendorId, message);
              continue;
            }
            parsedGarments.value.push(newGarment);
          }
        }
      } catch (err) {
        catchExcelError({ err, msg, uid: vendorId });
      }
      progress.value.proceed += 1;
    },
    beforeRead: function (): void {
      parsedGarments.value = [];
    },
    afterRead: function () {
      if (parsedGarments.value.length < 1) {
        return msg.warning("상품이 없습니다.");
      }
      console.log("after read ", parsedGarments.value);
      openPreviewModal.value = true;
    },
  });
  function handleFileChange(evt: Event) {
    disableModalSave.value = false;
    handleFChange(evt);
  }

  function onBtnClick() {
    if (excelInputRef.value) {
      excelInputRef.value.click();
    }
  }

  return {
    excelInputRef,
    onBtnClick,
    openPreviewModal,
    parsedGarments,
    onPreviewConfirm,
    onPreviewCancel,
    disableModalSave,
    authStore,
    handleFileChange,
  };
}
