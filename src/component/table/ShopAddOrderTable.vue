<script lang="ts" setup>
import {
  ORDER_STATE,
  IoColOpt,
  useTable,
  ORDER_GARMENT_DB,
  useReadShopOrderGInfo,
  useParseGarmentOrder,
  ProdOrderCombined,
  GarmentOrder,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { DataTableColumns, NImage, useMessage } from "naive-ui";
import { computed, h, ref, watchEffect } from "vue";
import { useLogger } from "vue-logger-plugin";
import ShopOrderCnt from "@/component/input/ShopOrderCnt.vue";
interface Props {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
  showSizes: boolean;
}
const msg = useMessage();
const props = defineProps<Props>();
const auth = useAuthStore();
const user = auth.currUser;
const fileModel = ref<File[]>([]);
const log = useLogger();
// >>>>> COLUMNS >>>>>
// 이미지, 상품정보, 도매이름, 주문수량, 예상미송수량, 판매가, 합계
const colKeys = [
  "userName",
  "prodName",
  "orderCnt",
  "allowPending",
  // "stockCnt",
  "actualAmount.orderAmount",
].map((c) => {
  return { key: c } as IoColOpt;
});
const tableRef = ref<any>(null);
const keyField = "id";
const { columns, mapper, checkedKeys } = useTable<ProdOrderCombined>({
  userId: user.userInfo.userId,
  colKeys,
  useChecker: true,
  keyField,
  onCheckAll: (to) => {
    if (tableRef.value) {
      const idxes = (tableRef.value.paginatedData as any[]).map((x) => x.index);
      checkedKeys.value = to
        ? orders.value
            .filter((o: any, idx: any) => idxes.includes(idx))
            .map((p: { [x: string]: any }) => p[keyField])
        : [];
    }
  },
});

const colResult = computed((): DataTableColumns<ProdOrderCombined> => {
  return columns.value.length > 0
    ? [
        columns.value[0],
        {
          key: "titleImgs",
          title: "이미지",
          render: (x) =>
            h(
              NImage,
              {
                src: x.vendorGarment?.titleImgs[0] ?? "/img/x.png",
                width: "50",
                height: "50",
              },
              {}
            ),
        },
        ...columns.value.slice(1),
      ]
    : [];
});
watchEffect(() => {
  columns.value.forEach((x) => {
    if (x.key === "orderCnt") {
      x.title = "주문/미송";
      x.render = (prodOrder: ProdOrderCombined) => {
        const order = orders.value.find((x) => {
          return x.items.some((i) => i.id === prodOrder.id);
        });
        return order
          ? h(ShopOrderCnt, {
              order,
              prodOrder,
              onSubmitPost: () => {
                !prodOrder.vendorGarment.allowPending
                  ? msg.warning(
                      "해당상품은 미송을 잡을 수 없는 상품입니다.",
                      makeMsgOpt()
                    )
                  : msg.info(`주문개수가 업데이트되었습니다.`, makeMsgOpt());
              },
            })
          : "x";
      };
    }
  });
});
async function deleteChecked() {
  const targetProds = garmentOrders.value.filter((x) =>
    checkedKeys.value.includes(x[keyField]!)
  );
  const ids = targetProds.map((prod) => prod.id);
  const targets: GarmentOrder[] = [];
  for (let i = 0; i < ids.length; i++) {
    const prodOrderId = ids[i];
    for (let j = 0; j < orders.value.length; j++) {
      const ord = orders.value[j];
      for (let k = 0; k < ord.items.length; k++) {
        const item = ord.items[k];
        if (item.id !== prodOrderId) continue;
        if (ord.items.length < 2) {
          if (!targets.map((z) => z.dbId).includes(ord.dbId)) {
            targets.push(ord);
          }
        } else {
          ord.items.splice(k, 1);
          await ord.update();
        }
      }
    }
  }
  return ORDER_GARMENT_DB.batchDelete(targets)
    .then(() => msg.success("삭제 성공.", makeMsgOpt()))
    .catch(() => msg.success("삭제 실패.", makeMsgOpt()));
}
async function deleteAll() {
  return ORDER_GARMENT_DB.batchDelete(orders.value)
    .then(() => msg.success("삭제 성공.", makeMsgOpt()))
    .catch(() => msg.success("삭제 실패.", makeMsgOpt()));
}
async function orderChecked() {
  const targets = garmentOrders.value.filter((x) =>
    checkedKeys.value.includes(x[keyField]!)
  );
  return Promise.all(targets.map((t: any) => ORDER_GARMENT_DB.orderGarment(t)))
    .then(() => msg.success("주문 성공.", makeMsgOpt()))
    .catch((err) => {
      msg.success(`주문 실패. ${err}`, makeMsgOpt());
      log.error(user.userInfo.userId, `주문 실패. ${err}`);
    });
}
async function orderAll() {
  return Promise.all(
    orders.value.map((t: any) => ORDER_GARMENT_DB.orderGarment(t))
  )
    .then(() => msg.success("주문 성공.", makeMsgOpt()))
    .catch((err) => {
      msg.success(`주문 실패. ${err}`, makeMsgOpt());
      log.error(user.userInfo.userId, `주문 실패. ${err}`);
    });
}
// function rowClassName(row: OrderShopGarmentJoined) {
//   const pendingCnt = row.allowPending
//     ? getPendingCnt(row.stockCnt!, row.orderCnt!)
//     : 0;
//   const orderAvailCnt = getOrderCnt(row.stockCnt!, row.orderCnt!, pendingCnt);
//   const orderNotAvailable = orderAvailCnt < row.orderCnt!;
//   return orderNotAvailable || pendingCnt > 0 ? "not-avail-order" : "";
// }
// <<<<< COLUMNS <<<<<

const { orders, existOrderIds, garmentOrders } = useReadShopOrderGInfo(
  user.userInfo.userId,
  props.inStates ?? [],
  props.notStates ?? []
);
useParseGarmentOrder(
  mapper,
  user.userInfo.userId,
  fileModel,
  existOrderIds,
  async (newOrders) => {
    log.debug("newOrders: ", newOrders);
    ORDER_GARMENT_DB.batchCreate(user.userInfo.userId, newOrders).then(() => {
      newOrders.forEach((ord) => {
        existOrderIds.value.add(ord.orderId);
      });
    });
  }
);
function downXlsx() {
  const a = document.createElement("a");
  // a.href = url
  a.href = "/example/sample.xlsx";
  a.download = "sample.xlsx";
  a.click();
  a.remove();
}
</script>
<template>
  <drop-zone-card
    style="width: 80%"
    :listenClick="false"
    v-model:fileModel="fileModel"
  >
    <template #header>
      <n-space justify="start">
        <n-button size="small" type="primary" @click="downXlsx">
          주문취합 엑셀양식 다운
        </n-button>
      </n-space>
    </template>
    <template #header-extra>
      <n-space
        v-if="orders && orders.length > 0"
        justify="start"
        style="margin-left: 5px"
        :wrap="false"
      >
        <n-button size="small" type="primary" @click="orderChecked">
          선택주문
        </n-button>
        <n-button size="small" type="primary" @click="orderAll">
          전체주문
        </n-button>
        <n-button size="small" type="primary" @click="deleteChecked">
          선택삭제
        </n-button>
        <n-button size="small" type="primary" @click="deleteAll">
          전체삭제
        </n-button>
      </n-space>
    </template>

    <n-data-table
      ref="tableRef"
      v-if="orders && orders.length > 0"
      :table-layout="'fixed'"
      :scroll-x="800"
      :columns="colResult"
      :data="garmentOrders"
      :pagination="
        showSizes
          ? {
              'show-size-picker': true,
              'page-sizes': [5, 10, 25, 50, 100],
            }
          : false
      "
      :bordered="false"
    />
  </drop-zone-card>
</template>

<style scoped>
/* :deep(.not-avail-order td) {
  color: red !important;
} */
</style>
<!-- ProdOrderCombined -->
