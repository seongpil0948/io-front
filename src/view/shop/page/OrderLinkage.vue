<script setup lang="ts">
import {
  useCafeAuth,
  getCafeOrders,
  LINKAGE_DB,
  ApiToken,
  useOrderParseCafe,
  useMapper,
  ORDER_GARMENT_DB,
  API_SERVICE_EX,
  GarmentOrder,
  TryStr,
  TryNum,
  MatchGarment,
  ShopGarment,
  ShopUserGarment,
  useShopGarmentTable,
} from "@/composable";
import { useAuthStore, useShopOrderStore, useVendorsStore } from "@/store";
import { dateRanges, commonTime } from "@/util";
import {
  useMessage,
  NButton,
  DataTableColumns,
  NDropdown,
  DropdownOption,
  NText,
} from "naive-ui";
import { h, onBeforeUnmount, computed, ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { storeToRefs } from "pinia";

const msg = useMessage();
const log = useLogger();
const auth = useAuthStore();
const { timeToDate } = commonTime();
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
const { parseCafeOrder, conditions } = useOrderParseCafe(
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

const matchData = ref<MatchGarment[]>([]);
const matchCols = computed(() => [
  {
    title: "서비스",
    key: "service",
    sorter: "default",
  },
  {
    title: "주문개수",
    key: "orderCnt",
  },
  {
    title: "ID",
    key: "ID",
    children: [
      {
        title: "매칭된ID",
        key: "id",
        render: (row: MatchGarment) =>
          h(
            NButton,
            {
              type: row.id ? "primary" : "error",
              text: row.id !== undefined,
              onClick: async () => {
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
              },
            },
            { default: () => row.id ?? "상품선택" }
          ),
      },
      {
        title: "외부ID",
        key: "inputId",
      },
    ],
  },
  {
    title: "상품명",
    key: "prodNameParent",
    children: [
      {
        title: "매칭된상품명",
        key: "prodName",
      },
      {
        title: "외부상품명",
        key: "inputProdName",
      },
    ],
  },
  {
    title: "입력옵션",
    key: "optionValue",
  },
  {
    title: "컬러",
    key: "color",
  },
  {
    title: "사이즈",
    key: "size",
  },
]);
const filterIsNull = ref(false);
function switchFilter(b: boolean) {
  filterIsNull.value = b;
}
const filteredMatchData = computed(() =>
  filterIsNull.value
    ? matchData.value.filter((x) => x.id === null)
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
          log.info(uid.value, "newOrders: ", orders ?? []);
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
        if (!orders || orders.length < 1) {
          msg.error(`주문이 없습니다~`);
        } else if (orders) {
          ORDER_GARMENT_DB.batchCreate(uid.value, orders)
            .then(() => {
              orders?.forEach((ord) => {
                ord.orderIds.forEach((id) => existOrderIds.value.add(id));
              });
              msg.success(`주문취합 ${orders?.length}건 취합성공!`);
            })
            .catch((err) => msg.error(`주문취합 실패 ${JSON.stringify(err)}`));
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

const rowOpts = [
  {
    label: "비활성화",
    key: "toDisable",
    disabled: true,
  },
  {
    label: "인증갱신",
    key: "refresh",
  },
  {
    label: "삭제",
    key: "delete",
  },
];
async function handleSelect(
  row: ApiToken,
  key: string | number,
  option: DropdownOption
) {
  if (option.key === "delete") {
    LINKAGE_DB.deleteToken(uid.value, row.dbId)
      .then(() => msg.info("삭제 완료"))
      .catch((err) => {
        msg.error("삭제 실패");
        log.error(uid.value, "삭제 실패", err);
      });
  } else {
    msg.info(String(key));
  }
}
const cols: DataTableColumns<ApiToken> = [
  {
    title: "활성화 여부",
    key: "no",
    render(row) {
      // const valid = row.no < 10;
      const valid = true;

      return h(
        NButton,
        {
          type: valid ? "primary" : "error",
          onClick: () => {
            msg.info(`Play ${JSON.stringify(row)}`);
          },
        },
        { default: () => (valid ? "가능" : "불가") }
      );
    },
  },
  {
    title: "서비스",
    key: "service",
  },
  {
    title: "쇼핑몰ID",
    key: "mallId",
  },
  {
    title: "메뉴",
    key: "actions",
    render(row) {
      const btn = h(NButton, {}, { default: () => "..." });
      return h(
        NDropdown,
        {
          trigger: "click",
          options: rowOpts,
          onSelect: (key: string | number, option: DropdownOption) =>
            handleSelect(row, key, option),
        },
        {
          default: () => btn,
        }
      );
    },
  },
  {
    title: "만료일",
    key: "expireAt",
    render: (row) =>
      h(
        NText,
        {
          primary: true,
        },
        {
          default: () => timeToDate(row.expireAt, "YYYY-MM-DD HH시 mm분"),
        }
      ),
  },
];
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
    <n-card v-if="filteredMatchData.length > 0" title="수동매칭관리">
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
    <n-data-table :columns="cols" :data="tokens" />
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
