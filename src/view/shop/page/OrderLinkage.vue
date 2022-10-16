<script setup lang="ts">
import {
  useCafeAuth,
  getCafeOrders,
  LINKAGE_DB,
  useOrderParseCafe,
  useMapper,
  ORDER_GARMENT_DB,
  API_SERVICE_EX,
  GarmentOrder,
  TryStr,
  TryNum,
  MatchGarment,
  ShopGarment,
  useShopGarmentTable,
  useApiTokenCols,
  getMatchCols,
} from "@/composable";
import { useAuthStore, useShopOrderStore, useVendorsStore } from "@/store";
import { dateRanges } from "@/util";
import { useMessage, NButton } from "naive-ui";
import { onBeforeUnmount, computed, ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { storeToRefs } from "pinia";

const msg = useMessage();
const log = useLogger();
const auth = useAuthStore();
const { apiTokenCol } = useApiTokenCols();
const uid = computed(() => auth.currUser.userInfo.userId);
const { tokens, unsubscribe } = LINKAGE_DB.getTokensByIdListen(uid.value);
onBeforeUnmount(() => unsubscribe());
// cafe - order module
const timeFormat = "yyyy-MM-dd";
const {
  dateRangeTime: range,
  startDate,
  endDate,
  updateRangeNaive,
} = dateRanges(true);
const { authorizeCafe, mallId } = useCafeAuth();
const { mapper } = useMapper(uid.value);
const shopOrderStore = useShopOrderStore();
const vendorStore = useVendorsStore();
const { existOrderIds } = storeToRefs(shopOrderStore);
const { parseCafeOrder } = useOrderParseCafe(mapper, uid.value, existOrderIds);
const { selectFunc, userProd, tableCols, openSelectList } =
  useShopGarmentTable(true);
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

const matchData = ref<MatchGarment[]>([]);
async function onClickId(row: MatchGarment) {
  console.info(`Play ${JSON.stringify(row)}`);
  selectFunc.value = async (s) => {
    const g = ShopGarment.fromJson(s);
    if (g) {
      g.cafeProdId = row.inputId;
      g.update().then(() => {
        row.id = g.shopProdId;
        row.color = g.color;
        row.size = g.size;
        row.prodName = g.prodName;
      });
    }
  };
  openSelectList.value = true;
}
const matchCols = getMatchCols(onClickId);
const filterIsNull = ref(false);
function switchFilter(b: boolean) {
  filterIsNull.value = b;
}
const filteredMatchData = computed(() =>
  filterIsNull.value
    ? matchData.value.filter((x) => x.id === undefined || x.id === null)
    : matchData.value
);
async function onGetOrder(useMatching = true, useMapping = true) {
  if (!startDate.value || !endDate.value)
    return msg.error("일자가 입력되지 않았습니다.");
  for (let i = 0; i < tokens.value.length; i++) {
    const token = tokens.value[i];
    try {
      if (token.service === "CAFE") {
        const cafeOrds = await getCafeOrders(
          startDate.value,
          endDate.value,
          token.dbId,
          auth.currUser.userInfo.userId,
          token.mallId
        );
        let orders: GarmentOrder[] | undefined = undefined;
        if (useMapping) {
          orders = parseCafeOrder(cafeOrds);
        } else if (useMatching) {
          matchData.value = [];
          for (let i = 0; i < cafeOrds.length; i++) {
            const order = cafeOrds[i];
            const orderId = order.order_id;
            if (existOrderIds.value.has(orderId)) continue;
            else if (order.canceled === "T") continue;
            else if (order.paid !== "T") continue;
            for (let i = 0; i < order.items.length; i++) {
              const item = order.items[i];
              const inputProdName: TryStr =
                item.product_name ?? item.product_name_default;
              const orderCnt: TryNum = item.quantity;
              const prodId: TryStr = token.mallId + item.product_code;
              const garment = userProd.value.find(
                (x) => x.cafeProdId && x.cafeProdId === prodId
              );
              const missing = garment === null || garment === undefined;
              matchData.value.push({
                service: "CAFE",
                orderCnt: orderCnt ?? 1,
                id: missing ? undefined : garment!.shopProdId,
                inputId: prodId!,
                color: missing ? undefined : garment!.color,
                size: missing ? undefined : garment!.size,
                prodName: missing ? undefined : garment!.prodName,
                inputProdName: inputProdName!,
                optionValue: item.option_value,
                orderId,
              });
            }
          }
        }
        if ((!orders || orders.length < 1) && matchData.value.length < 1) {
          msg.error(`주문이 없습니다~`);
        } else if (orders) {
          ORDER_GARMENT_DB.batchCreate(uid.value, orders)
            .then(() => {
              orders?.forEach((ord) => {
                ord.orderIds.forEach((id) => existOrderIds.value.add(id));
              });
              msg.success(`주문취합 ${orders?.length}건 취합성공!`);
            })
            .catch((err) => {
              const message = `주문취합 실패 ${
                err instanceof Error ? err.message : JSON.stringify(err)
              }`;
              msg.error(message);
              log.error(uid.value, message);
            });
        }
      }
    } catch (err) {
      console.error(err);
      return msg.error(
        `${token.service} ${token.mallId}  주문을 받아오는 과정에서 실패하였습니다. 상세: ${err}`
      );
    }
  }
}
async function saveMatch() {
  const orders: GarmentOrder[] = [];
  for (let i = 0; i < matchData.value.length; i++) {
    const data = matchData.value[i];
    if (!data.id) continue;
    const g = userProd.value.find((x) => x.shopProdId === data.id);
    if (!g) return msg.error("소매처 상품이 없습ㄴ디ㅏ.");
    const vendorProd = vendorStore.vendorUserGarments.find(
      (x) => x.vendorProdId === g?.vendorProdId
    );
    if (!vendorProd) return msg.error("도매처 상품이 없습니다.");
    orders.push(
      GarmentOrder.fromProd(g, [data.orderId], data.orderCnt, vendorProd)
    );
  }
  ORDER_GARMENT_DB.batchCreate(uid.value, orders)
    .then(() => {
      orders?.forEach((ord) => {
        ord.orderIds.forEach((id) => existOrderIds.value.add(id));
      });
      msg.success(`${orders?.length} 주문 건 성공`);
    })
    .finally(() => {
      matchData.value = [];
    });
}
</script>

<template>
  <n-space vertical>
    <n-card title="주문연동">
      <n-space vertical>
        <n-space>
          <n-h5 style="text-align: start"
            >주문내역 일자 범위선택 (3개월이내)</n-h5
          >
          <n-date-picker
            v-model:value="range"
            @update:formatted-value="updateRangeNaive"
            type="daterange"
            start-placeholder="부터"
            end-placeholder="까지"
            :format="timeFormat"
            clearable
          />
        </n-space>

        <n-space>
          <n-button class="big" @click="() => onGetOrder(false, true)">
            활성 서비스 매핑 취합
          </n-button>
          <n-button class="big" @click="() => onGetOrder(true, false)">
            활성 서비스 수동 취합
          </n-button>
          <n-popover trigger="click">
            <template #trigger>
              <n-button class="big"> 카페24 연동 </n-button>
            </template>
            <n-h5 style="width: 100%; text-align: start">쇼핑몰 ID 입력</n-h5>
            <n-space vertical align="end">
              <n-input v-model:value="mallId" />
              <n-button @click="goAuthorizeCafe">연동하기</n-button>
            </n-space>
          </n-popover>
        </n-space>
      </n-space>
    </n-card>
    <n-card title="수동매칭관리">
      <n-space style="margin-bottom: 10px" justify="end">
        <n-button v-if="filterIsNull" @click="() => switchFilter(false)"
          >전체보기</n-button
        >
        <n-button v-else @click="() => switchFilter(true)"
          >매칭실패만보기</n-button
        >
      </n-space>
      <n-data-table
        :data="filteredMatchData"
        :columns="matchCols"
        :single-line="false"
        :pagination="{
          'show-size-picker': true,
          'page-sizes': [5, 10, 25, 50, 100],
        }"
        :bordered="false"
      />
      <template #action>
        <n-space justify="end">
          <n-button @click="saveMatch">주문데이터로 넘기기</n-button>
        </n-space>
      </template>
    </n-card>
    <n-h2>API 계정 관리</n-h2>
    <n-data-table :columns="apiTokenCol" :data="tokens" />
  </n-space>
  <n-modal v-model:show="openSelectList">
    <n-card title="상품선택" :bordered="false" size="large">
      <n-data-table
        ref="tableRef"
        :columns="tableCols"
        :data="userProd"
        :pagination="{
          'show-size-picker': true,
          'page-sizes': [5, 10, 25, 50, 100],
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="1200"
      />
    </n-card>
  </n-modal>
</template>

<style scoped>
.big {
  width: 20vw;
  height: 10vw;
}
</style>
