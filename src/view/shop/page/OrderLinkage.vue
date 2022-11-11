<script setup lang="ts">
import {
  useCafeAuth,
  getCafeOrders,
  LINKAGE_DB,
  useMapper,
  ORDER_GARMENT_DB,
  API_SERVICE_EX,
  GarmentOrder,
  MatchGarment,
  ShopGarment,
  useShopGarmentTable,
  useApiTokenCols,
  getMatchCols,
  useSearch,
  matchCafeOrder,
  useMappingOrderCafe,
  saveMatch,
  getZigzagOrders,
} from "@/composable";
import { useAuthStore, useShopOrderStore, useVendorsStore } from "@/store";
import { dateRanges } from "@/util";
import { useMessage, NButton } from "naive-ui";
import { onBeforeUnmount, computed, ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { storeToRefs } from "pinia";
import { matchZigzagOrder } from "@/composable/order/use/parse-zigzag";

const msg = useMessage();
const log = useLogger();
const auth = useAuthStore();
const { apiTokenCol } = useApiTokenCols();
const uid = computed(() => auth.currUser.userInfo.userId);
const { tokens, unsubscribe } = LINKAGE_DB.getTokensByIdListen(uid.value);
onBeforeUnmount(() => unsubscribe());
// cafe - order module
const showRegitZig = ref(false);
function onZigSubmit() {
  showRegitZig.value = false;
}
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
const { parseCafeOrder } = useMappingOrderCafe(
  mapper,
  uid.value,
  existOrderIds
);
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
// use select in modal
const { search, searchedData, searchInputVal } = useSearch({
  data: userProd,
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return v === null
      ? true
      : x.size.includes(v) || x.color.includes(v) || x.prodName.includes(v);
  },
});

const matchData = ref<MatchGarment[]>([]);
async function onClickId(row: MatchGarment) {
  selectFunc.value = async (s) => {
    const g = ShopGarment.fromJson(s);
    if (g) {
      if (row.service === "CAFE") {
        g.cafeProdId = row.inputId;
      } else if (row.service === "ZIGZAG") {
        g.zigzagProdId = row.inputId;
      } else {
        return log.error(`not matched api service: ${row.service}`);
      }

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
          uid.value,
          token.mallId!
        );
        let orders: GarmentOrder[] | undefined = undefined;
        if (useMapping) {
          orders = parseCafeOrder(cafeOrds);
        } else if (useMatching) {
          matchData.value = matchCafeOrder(
            cafeOrds,
            token,
            existOrderIds.value,
            userProd.value
          );
        }
        if ((!orders || orders.length < 1) && matchData.value.length < 1) {
          continue;
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
      } else if (token.service === "ZIGZAG") {
        const zigOrds = await getZigzagOrders(
          startDate.value,
          endDate.value,
          token.dbId,
          uid.value
        );
        if (useMatching) {
          matchData.value.push(
            ...matchZigzagOrder(
              zigOrds,
              existOrderIds.value,
              token.alias,
              userProd.value
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      return msg.error(
        `${token.service} ${
          token.alias ?? token.mallId
        }  주문을 받아오는 과정에서 실패하였습니다. 상세: ${err}`
      );
    }
  }
}
async function onSaveMatch() {
  await saveMatch(
    matchData.value,
    userProd.value,
    vendorStore.vendorUserGarments,
    uid.value,
    existOrderIds
  );
  matchData.value = [];
}
</script>

<template>
  <n-space vertical>
    <n-card title="주문연동">
      <n-space vertical>
        <n-space>
          <n-h5 style="text-align: start"
            >주문내역 일자 범위선택 (1개월이내)</n-h5
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
          <n-button @click="() => onGetOrder(false, true)">
            매핑 취합
          </n-button>
          <n-button @click="() => onGetOrder(true, false)">
            수동 매칭 취합
          </n-button>
          <n-popover trigger="click">
            <template #trigger>
              <n-button> 카페24 연동 </n-button>
            </template>
            <n-h5 style="width: 100%; text-align: start">쇼핑몰 ID 입력</n-h5>
            <n-space vertical align="end">
              <n-input v-model:value="mallId" />
              <n-button @click="goAuthorizeCafe">연동하기</n-button>
            </n-space>
          </n-popover>
          <n-popover v-model:show="showRegitZig" trigger="click">
            <template #trigger>
              <n-button> 지그재그 연동 </n-button>
            </template>
            <zigzag-register-api-form @submitToken="onZigSubmit" />
          </n-popover>
        </n-space>
      </n-space>
    </n-card>
    <n-card title="수동매칭관리" v-if="matchData.length > 0">
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
        :table-layout="'fixed'"
        :scroll-x="800"
      />
      <template #action>
        <n-space justify="end">
          <n-button @click="onSaveMatch">주문데이터로 넘기기</n-button>
        </n-space>
      </template>
    </n-card>
    <n-h2>API 계정 관리</n-h2>
    <n-data-table :columns="apiTokenCol" :data="tokens" />
  </n-space>
  <n-modal v-model:show="openSelectList">
    <n-card title="상품선택" :bordered="false" size="large">
      <template #header-extra>
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search">검색</n-button>
      </template>
      <n-data-table
        ref="tableRef"
        :columns="tableCols"
        :data="searchedData"
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
