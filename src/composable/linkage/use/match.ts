import {
  AnyOrder,
  API_SERVICE_EX,
  //   cafeMapProcessor,
  catchError,
  getExternalSource,
  getMatchCols,
  LINKAGE_DB,
  mapCafeOrder,
  Mapper,
  matchCafeOrder,
  matchZigzagOrder,
  saveMatch,
  useCafeAuth,
  useCommon,
  useMapper,
  useSearch,
  useShopVirtualProd,
} from "@/composable";
import {
  MatchGarment,
  ShopGarment,
  useShopGarmentTable,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable/product";
import { useShopOrderStore } from "@/store";
import { dateRanges, makeMsgOpt } from "@/util";
import { storeToRefs } from "pinia";
import { shallowRef, ref, onBeforeUnmount, watchEffect, computed } from "vue";

export function useMatch(d: { afterReverseMap?: () => Promise<void> }) {
  const { msg, log, auth, uid } = useCommon();
  const { mapper } = useMapper(uid.value);
  const cafeOrders = shallowRef<AnyOrder[]>([]);
  const zigzagOrders = shallowRef<AnyOrder[]>([]);
  const matchData = ref<MatchGarment[]>([]);
  const timeFormat = "yyyy-MM-dd";
  const {
    dateRangeTime: range,
    startDate,
    endDate,
    updateRangeNaive,
  } = dateRanges(true);
  const { tokens, unsubscribe } = LINKAGE_DB.getTokensByIdListen(uid.value);
  const shopOrderStore = useShopOrderStore();
  const { existOrderIds } = storeToRefs(shopOrderStore);
  onBeforeUnmount(() => unsubscribe());

  const { userVirProds, virVendorProds } = useShopVirtualProd(auth.currUser);
  const { selectFunc, userProd, tableCols, openSelectList } =
    useShopGarmentTable(true, userVirProds);

  const vendorProds = shallowRef<VendorGarment[]>([]);
  watchEffect(async () => {
    const ids = userProd.value.map((x) => x.vendorProdId);
    vendorProds.value = [
      ...virVendorProds.value,
      ...(await VENDOR_GARMENT_DB.listByIds(ids)),
    ];
  });
  const matchCols = getMatchCols(onClickId);

  const { authorizeCafe, mallId } = useCafeAuth();
  function goAuthorizeCafe() {
    if (
      tokens.value.filter(
        (x) => x.service === API_SERVICE_EX.CAFE && x.mallId === mallId.value
      ).length > 0
    ) {
      return msg.error("이미 해당 쇼핑몰ID의 토큰이 존재합니다.");
    }
    return authorizeCafe();
  }
  const useMatching = ref(true);
  const useMapping = ref(true);

  async function onGetOrder() {
    matchData.value = [];
    if (!startDate.value || !endDate.value)
      return msg.error("일자가 입력되지 않았습니다.");
    for (let i = 0; i < tokens.value.length; i++) {
      const token = tokens.value[i];
      try {
        if (token.service === "CAFE") {
          if (!token.mallId) {
            log.error(
              uid.value,
              `cafe24 token(${token.dbId}) mallId not exist`
            );
            return msg.error("cafe24 토큰 mallId 가 없습니다.");
          }
          cafeOrders.value = await getExternalSource({
            startDate: startDate.value,
            endDate: endDate.value,
            tokenId: token.dbId,
            userId: uid.value,
            mallId: token.mallId,
          });
        } else if (token.service === "ZIGZAG") {
          zigzagOrders.value = await getExternalSource({
            startDate: startDate.value,
            endDate: endDate.value,
            tokenId: token.dbId,
            userId: uid.value,
          });
        }
        processAll();
      } catch (err) {
        // if (err instanceof MapColNotFound) {}
        catchError({
          err,
          msg,
          uid: uid.value,
          prefix: `${token.service} ${
            token.alias ?? token.mallId
          }  주문을 받아오는 과정에서 실패하였습니다. 상세: `,
        });
      }
    }
  }

  async function onClickId(row: MatchGarment) {
    selectFunc.value = async (s) => {
      const g = ShopGarment.fromJson(s);
      if (!g) throw new Error("result of ShopGarment.fromJson is null ");
      const fillTable = () => {
        row.id = g.shopProdId;
        row.color = g.color;
        row.size = g.size;
        row.prodName = g.prodName;
      };

      if (row.matchType === "id") {
        if (row.service === "CAFE") {
          g.cafeProdId = row.inputId;
        } else if (row.service === "ZIGZAG") {
          g.zigzagProdId = row.inputId;
        } else {
          return log.error(`not matched api service: ${row.service}`);
        }

        g.update().then(() => fillTable());
      } else if (row.matchType === "map" && mapper.value) {
        reverseMapping(mapper.value, row, g).then(async () => {
          if (row.service === "CAFE" || row.service === "ZIGZAG") processAll();
          await d.afterReverseMap?.();
        });
      }
    };
    openSelectList.value = true;
  }

  async function onSaveMatch() {
    await saveMatch(
      matchData.value,
      userProd.value,
      uid.value,
      existOrderIds,
      vendorProds.value
    );
    matchData.value = [];
  }
  function processAll() {
    matchData.value = [];
    processZigzag();
    processCafe();
  }
  function processZigzag() {
    if (useMatching.value) {
      const { result, cnt } = matchZigzagOrder(
        zigzagOrders.value,
        existOrderIds.value,
        userProd.value
      );
      matchData.value.push(...result);
      msg.info(
        `지그재그 전체 주문건: ${cnt.orderCnt}, 유효하지 않은 주문건: ${cnt.invalid}, 이미 진행된 주문건: ${cnt.exist}`,
        makeMsgOpt()
      );
    }
  }
  function processCafe() {
    // let orders: IoOrder[] | undefined = undefined;
    if (useMapping.value && mapper.value) {
      matchData.value.push(
        ...mapCafeOrder(cafeOrders.value, mapper.value, existOrderIds.value)
      );
      // const conditions = cafeMapProcessor.getConditions(
      //   cafeOrds,
      //   mapper.value,
      //   existOrderIds.value
      // );
      // orders = cafeMapProcessor.getOrdersByCondi(
      //   conditions,
      //   vendorProds.value,
      //   userProd.value
      // );
    } else if (useMatching.value) {
      matchData.value.push(
        ...matchCafeOrder(cafeOrders.value, existOrderIds.value, userProd.value)
      );
    }
    // if ((!orders || orders.length < 1) && matchData.value.length < 1) {
    //   continue;
    // } else if (orders) {
    //   ORDER_GARMENT_DB.batchCreate(uid.value, orders)
    //     .then(() => {
    //       orders?.forEach((ord) => {
    //         ord.orderIds.forEach((id) => existOrderIds.value.add(id));
    //       });
    //       msg.success(`주문취합 ${orders?.length}건 취합성공!`);
    //     })
    //     .catch((err) =>
    //       catchError({
    //         err,
    //         msg,
    //         uid: uid.value,
    //         prefix: `주문취합 실패 `,
    //       })
    //     );
    // }
  }

  const showMatchModal = ref(false);
  watchEffect(() => {
    if (matchData.value.length > 0) {
      showMatchModal.value = true;
    } else {
      showMatchModal.value = false;
    }
  });

  const { search, searchedData, searchInputVal } = useSearch({
    data: userProd,
    filterFunc: (x, searchVal) => {
      const v: typeof searchVal = searchVal;
      return v === null
        ? true
        : x.size.includes(v) || x.color.includes(v) || x.prodName.includes(v);
    },
  });

  const filterIsNull = ref(false);
  function switchFilter(b: boolean) {
    filterIsNull.value = b;
  }
  const filteredMatchData = computed(() =>
    filterIsNull.value
      ? matchData.value.filter((x) => x.id === undefined || x.id === null)
      : matchData.value
  );
  return {
    msg,
    log,
    auth,
    uid,
    mapper,
    matchData,
    range,
    startDate,
    endDate,
    updateRangeNaive,
    timeFormat,
    goAuthorizeCafe,
    authorizeCafe,
    mallId,
    onGetOrder,
    userProd,
    selectFunc,
    onSaveMatch,
    tableCols,
    openSelectList,
    tokens,
    matchCols,
    useMatching,
    useMapping,
    showMatchModal,
    search,
    searchedData,
    searchInputVal,
    switchFilter,
    filteredMatchData,
    filterIsNull,
  };
}

export async function reverseMapping(
  mapper: Mapper,
  m: { inputProdName?: string; inputSize?: string; inputColor?: string },
  g: ShopGarment
) {
  if (!m.inputProdName || !m.inputSize || !m.inputColor) {
    throw new Error(`
  reverseMapping error, input null field with inputProdName(${m.inputProdName}) | inputSize(${m.inputSize}) | inputColor(${m.inputColor}) |`);
  } else if (!mapper) return;
  mapper.setColVal("prodName", g.shopProdId, g.prodName, m.inputProdName);
  mapper.setColVal("size", g.shopProdId, g.size, m.inputSize);
  mapper.setColVal("color", g.shopProdId, g.color, m.inputColor);
  return mapper.update();
}
