<script setup lang="ts">
import {
  useCafeAuth,
  getCafeOrders,
  LINKAGE_DB,
  ApiToken,
  useOrderParseCafe,
  useMapper,
  ORDER_GARMENT_DB,
} from "@/composable";
import { useAuthStore, useShopOrderStore } from "@/store";
import { dateRanges, commonTime } from "@/util";
import {
  useMessage,
  NButton,
  DataTableColumns,
  NDropdown,
  DropdownOption,
  NText,
} from "naive-ui";
import { h, onBeforeUnmount, computed } from "vue";
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
const { existOrderIds } = storeToRefs(shopOrderStore);
const { parseCafeOrder, conditions } = useOrderParseCafe(
  mapper,
  uid.value,
  existOrderIds
);
async function onGetOrder() {
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

        const orders = parseCafeOrder(cafeOrds);
        log.info(uid.value, "newOrders: ", orders);
        if (orders) {
          ORDER_GARMENT_DB.batchCreate(uid.value, orders).then(() => {
            orders.forEach((ord) => {
              ord.orderIds.forEach((id) => existOrderIds.value.add(id));
            });
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
    disabled: true,
  },
];
function handleSelect(
  row: ApiToken,
  key: string | number,
  option: DropdownOption
) {
  msg.info(String(key));
  console.log("option: ", option);
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
          <n-h5 style="text-align: start">쇼핑몰 ID 입력</n-h5>
          <n-input v-model:value="mallId" />
        </n-space>
        <n-space>
          <n-button class="big" @click="authorizeCafe"> 카페24 연동 </n-button>
          <n-button class="big" @click="onGetOrder">
            활성 서비스 주문 취합
          </n-button>
        </n-space>
      </n-space>
    </n-card>
    <n-h2>API 계정 관리</n-h2>
    <n-data-table :columns="cols" :data="tokens" />
  </n-space>
</template>

<style scoped>
.big {
  width: 20vw;
  height: 10vw;
}
</style>
