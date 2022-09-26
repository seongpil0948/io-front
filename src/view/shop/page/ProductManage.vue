<script setup lang="ts">
import {
  SHOP_GARMENT_DB,
  ORDER_GARMENT_DB,
  GarmentOrder,
  useShopGarmentTable,
} from "@/composable";
import { useAuthStore, useVendorsStore } from "@/store";
import { makeMsgOpt, isMobile } from "@/util";
import { NButton, useMessage } from "naive-ui";
import { v4 as uuidv4 } from "uuid";
import { useLogger } from "vue-logger-plugin";

const authStore = useAuthStore();
const msg = useMessage();

const log = useLogger();
const vendorStore = useVendorsStore();
const { tableCols, mapper, checkedKeys, userProd, popVal, selectedRow } =
  useShopGarmentTable(false);
async function onCheckedDelete() {
  await SHOP_GARMENT_DB.deleteShopGarments(
    authStore.currUser.userInfo.userId,
    checkedKeys.value
  );
  msg.success("삭제 완료", makeMsgOpt());
}
async function onCheckedOrder() {
  const orders: GarmentOrder[] = [];
  for (let i = 0; i < checkedKeys.value.length; i++) {
    const prod = userProd.value.find(
      (x) => x.shopProdId === checkedKeys.value[i]
    )!;

    const vendorProd = vendorStore.vendorUserGarments.find(
      (y) => y.vendorProdId === prod.vendorProdId
    );
    if (!vendorProd) {
      return msg.error("도매 상품정보가 존재하지 않습니다", makeMsgOpt());
    }
    const order = GarmentOrder.fromProd(prod, [uuidv4()], 1, vendorProd);
    orders.push(order);
  }
  ORDER_GARMENT_DB.batchCreate(authStore.currUser.userInfo.userId, orders)
    .then(() =>
      msg.success(
        `${orders.length} 개 상품 주문데이터 생성이 완료 되었습니다.`,
        makeMsgOpt()
      )
    )
    .catch((err) => {
      msg.error("상품 데이터 생성에 실패 하였습니다.", makeMsgOpt());
      log.error(
        authStore.currUser.userInfo.userId,
        "상품 데이터 생성에 실패",
        err
      );
    });
}
function updateOrderId(arr: string[]) {
  mapper?.value?.setSyno("orderId", arr);
}
</script>
<template>
  <n-space vertical>
    <n-card style="width: 80%">
      <template #header>
        <n-h4 v-if="!isMobile()">
          상품정보 변경을 위해서 옵션 선택을 이용 해주세요!
        </n-h4>
      </template>
      <template #header-extra>
        <n-button
          v-if="!isMobile()"
          @click="onCheckedDelete"
          size="small"
          round
          type="primary"
          style="margin-right: 5px"
        >
          선택 상품 삭제</n-button
        >
        <n-button
          @click="onCheckedOrder"
          v-if="!isMobile()"
          size="small"
          round
          type="primary"
        >
          선택 상품 주문</n-button
        >
      </template>
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
    <n-card>
      <n-h3> 주문번호 매핑</n-h3>
      <n-dynamic-tags
        :value="mapper?.getSyno('orderId')"
        @update:value="updateOrderId"
      />
      <template #action>
        <n-button
          round
          type="primary"
          @click="
            async () =>
              mapper
                ?.update()
                .then(() => msg.success('업데이트 성공', makeMsgOpt()))
                .catch(() => msg.error('업데이트 실패', makeMsgOpt()))
          "
        >
          저장
        </n-button>
      </template>
    </n-card>
  </n-space>
  <shop-prod-modify-modal
    v-if="popVal === 'Edit'"
    v-model:userProd="selectedRow"
    @onClose="selectedRow = null"
  />
</template>
