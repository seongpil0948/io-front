import {
  AblyOrderItem,
  AnyOrder,
  API_SERVICE_EX,
  //   cafeMapProcessor,
  catchError,
  getExternalSource,
  getMatchCols,
  LINKAGE_DB,
  mapCafeOrder,
  Mapper,
  mapTxt,
  matchCafeOrder,
  matchZigzagOrder,
  ParseResultInfo,
  saveMatch,
  useCafeAuth,
  useCommon,
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
import { logger } from "@/plugin/logger";
import { useShopOrderStore } from "@/store";
import { dateRanges, makeMsgOpt } from "@/util";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";
import { storeToRefs } from "pinia";
import { shallowRef, ref, onBeforeUnmount, watchEffect, computed } from "vue";
import { matchAblyOrder } from "../parser/ably";

export function useMatch(d: { afterReverseMap?: () => Promise<void> }) {
  const { msg, log, auth, uid } = useCommon();
  const cafeOrders = shallowRef<AnyOrder[]>([]);
  const zigzagOrders = shallowRef<AnyOrder[]>([]);
  const ablyOrders = shallowRef<AblyOrderItem[]>([]);
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
  const { existOrderIds, mapper } = storeToRefs(shopOrderStore);
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
    else if (useMatching.value === useMapping.value) {
      return msg.error("수동 또는 매핑 한개의 취합을 선택 해야합니다.");
    }
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
          processCafe();
        } else if (token.service === "ZIGZAG") {
          zigzagOrders.value = await getExternalSource({
            startDate: startDate.value,
            endDate: endDate.value,
            tokenId: token.dbId,
            userId: uid.value,
          });
          processZigzag();
        } else if (token.service === "ABLY") {
          if (typeof token.clientId !== "string") {
            return log.error(uid.value, "token email(clientId) is not string");
          }
          ablyOrders.value = await getExternalSource({
            userId: uid.value,
            startDate: startDate.value,
            endDate: endDate.value,
            page: 1,
            email: token.clientId,
          });
          processAbly();
        }
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

  const targetGarment = shallowRef<null | MatchGarment>(null);
  async function onClickId(row: MatchGarment) {
    selectFunc.value = async (s) => {
      console.log("in selectFunc", row);
      matchData.value = [];
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
        } else if (row.service === "ABLY") {
          g.ablyProdId = row.inputId;
        } else {
          return log.error(`not matched api service: ${row.service}`);
        }

        g.update().then(() => fillTable());
      } else if (row.matchType === "map" && mapper.value) {
        reverseMapping(mapper.value, row, g);
        console.log("in selectFunc", mapper.value, g);
        await shopOrderStore.mapperUpdate();
        await d.afterReverseMap?.();
        if (row.service === "CAFE") {
          processCafe();
        } else if (row.service === "ZIGZAG") {
          processZigzag();
        } else if (row.service === "ABLY") {
          processAbly();
        }
      }
    };
    targetGarment.value = row;
    openSelectList.value = true;
  }

  async function onSaveMatch() {
    try {
      const cnt = await saveMatch(
        matchData.value,
        userProd.value,
        uid.value,
        existOrderIds,
        vendorProds.value
      );
      msg.info(`${cnt} 행 성공`);
    } catch (err) {
      catchError({ msg, err, uid: uid.value });
    }
    matchData.value = [];
  }
  function processAbly() {
    const { result, cnt } = matchAblyOrder(
      ablyOrders.value,
      existOrderIds.value,
      userProd.value
    );
    matchData.value.push(...result);
    expressParseResult(cnt, msg, uid.value);
  }
  function processZigzag() {
    if (useMatching.value) {
      const { result, cnt } = matchZigzagOrder(
        zigzagOrders.value,
        existOrderIds.value,
        userProd.value
      );
      matchData.value.push(...result);
      expressParseResult(cnt, msg, uid.value);
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
    }
    if (useMatching.value) {
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
    targetGarment,
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

export function reverseMapping(
  mapper: Mapper,
  m: { inputProdName?: string; inputSize?: string; inputColor?: string },
  g: ShopGarment
) {
  console.log("in reverseMapping", mapper, m, g);
  if (!m.inputProdName || !m.inputSize || !m.inputColor) {
    throw new Error(`
  reverseMapping error, input null field with inputProdName(${m.inputProdName}) | inputSize(${m.inputSize}) | inputColor(${m.inputColor}) |`);
  } else if (!mapper) return;
  mapper.setColVal(
    "prodName",
    g.shopProdId,
    mapTxt(g.prodName),
    mapTxt(m.inputProdName)
  );
  mapper.setColVal("size", g.shopProdId, mapTxt(g.size), mapTxt(m.inputSize));
  mapper.setColVal(
    "color",
    g.shopProdId,
    mapTxt(g.color),
    mapTxt(m.inputColor)
  );
}

function expressParseResult(
  cnt: ParseResultInfo,
  msg: MessageApiInjection,
  uid: string
) {
  const str = `${cnt.service} 전체 주문건: ${cnt.orderCnt}, 유효하지 않은 주문건: ${cnt.invalid}, 이미 진행된 주문건: ${cnt.exist}`;
  msg.info(str, makeMsgOpt());
  logger.info(uid, str);
}
