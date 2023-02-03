<script setup lang="ts">
import {
  ORDER_GARMENT_DB,
  IoOrder,
  useShopGarmentTable,
  newOrdFromItem,
  newOrdItem,
  VENDOR_GARMENT_DB,
  VendorGarment,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt, isMobile } from "@/util";
import {
  NButton,
  NCard,
  NDataTable,
  NDynamicTags,
  NH3,
  NH4,
  NSpace,
  useMessage,
} from "naive-ui";
import { uuidv4 } from "@firebase/util";
import { computed, shallowRef, watchEffect } from "vue";
import { useShopProdStore } from "@/store/shopProd";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const shopProdStore = useShopProdStore();
const { data } = storeToRefs(shopProdStore);
const msg = useMessage();
const {
  tableCols,
  mapper,
  mapperUpdate,
  checkedKeys,
  popVal,
  selectedRow,
  onCheckedDelete,
  tableRef,
} = useShopGarmentTable(false, data);
const cols = computed(() =>
  tableCols.value.filter((x) => (x as any).key !== "select")
);

const vendorProds = shallowRef<VendorGarment[]>([]);
watchEffect(async () => {
  const ids = data.value.map((x) => x.vendorProdId);
  const result = await VENDOR_GARMENT_DB.listByIds(ids);
  vendorProds.value = result;
});
async function onCheckedOrder() {
  const orders: IoOrder[] = [];
  for (let i = 0; i < checkedKeys.value.length; i++) {
    const prod = data.value.find((x) => x.shopProdId === checkedKeys.value[i])!;
    if (!prod) continue;

    const vendorProd = vendorProds.value.find(
      (y) => y.vendorProdId === prod.vendorProdId
    );
    if (!vendorProd) {
      return msg.error("도매 상품정보가 존재하지 않습니다", makeMsgOpt());
    }
    const item = newOrdItem({
      vendorProd,
      shopProd: prod,
      orderIds: [uuidv4()],
      orderCnt: 1,
      shipFeeAmount: 0,
      shipFeeDiscountAmount: 0,
      pickFeeAmount: 0,
      pickFeeDiscountAmount: 0,
      tax: 0,
      paidAmount: 0,
      paid: "NO",
      paymentConfirm: false,
    });
    const order = newOrdFromItem([item]);
    orders.push(order);
  }
  await ORDER_GARMENT_DB.batchCreate(
    authStore.currUser.userInfo.userId,
    orders
  );
  msg.success(
    `${orders.length} 개 상품 주문데이터 생성이 완료 되었습니다.`,
    makeMsgOpt()
  );
}
function updateOrderId(arr: string[]) {
  mapper?.value?.setSyno("orderId", arr);
}
</script>
<template>
  <n-space
    vertical
    align="center"
    item-style="width: 100%;"
    style="overflow: auto"
  >
    <n-card>
      <template #header>
        <n-h4 v-if="!isMobile()">
          상품정보 변경을 위해서 옵션 선택을 이용 해주세요!
        </n-h4>
      </template>
      <template #header-extra>
        <n-button
          v-if="!isMobile()"
          size="small"
          round
          type="primary"
          style="margin-right: 5px"
          @click="onCheckedDelete"
        >
          선택 상품 삭제
        </n-button>
        <n-button
          v-if="!isMobile()"
          size="small"
          round
          type="primary"
          @click="onCheckedOrder"
        >
          선택 상품 주문
        </n-button>
      </template>
      <n-data-table
        ref="tableRef"
        :columns="cols"
        :data="data"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="800"
      />
    </n-card>
    <n-card style="width: 100%">
      <n-h3> 주문번호 매핑</n-h3>
      <n-dynamic-tags
        :value="mapper?.getSyno('orderId')"
        @update:value="updateOrderId"
      />
      <template #action>
        <n-button round type="primary" @click="mapperUpdate"> 저장 </n-button>
      </template>
    </n-card>
  </n-space>
  <shop-prod-modify-modal
    v-if="popVal === 'Edit'"
    v-model:userProd="selectedRow"
    @on-close="selectedRow = null"
  />
</template>
