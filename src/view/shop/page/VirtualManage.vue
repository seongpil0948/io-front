<script setup lang="ts">
import {
  IoOrder,
  useSearch,
  useShopGarmentTable,
  useShopVirtualProd,
  VendorGarment,
  newOrdFromItem,
  newOrdItem,
  ORDER_GARMENT_DB,
} from "@/composable";
import { useAuthStore } from "@/store";
import { NModal, NButton, useMessage } from "naive-ui";
import { computed, ref } from "vue";
import { uuidv4 } from "@firebase/util";
import { makeMsgOpt } from "@io-boxies/vue-lib";
import { isMobile } from "@io-boxies/js-lib";
// TODO: 상품 수정 및 삭제 기능 추가
// 주문 번호등 정보는 가상에서 전환했을때나 실제 주문에서도 중복을 방지하기 위해... 기존 컬렉션과 겹쳐야 할듯. 다음단계로만 못넘어가게. (완료처리론 넘겨도 되지않나?)
// 회의필요.

const regitProdModal = ref(false);
function changeRegitProdModal() {
  regitProdModal.value = !regitProdModal.value;
}
function onRegistered(vGarments: VendorGarment[]) {
  console.log("onRegistered", vGarments);
  regitProdModal.value = false;
}
const msg = useMessage();
const auth = useAuthStore();
const { virShopProds, virVendorProds } = useShopVirtualProd(auth.currUser);
const userVirProds = computed(() =>
  virShopProds.value.map((x) => Object.assign({}, x, auth.currUser))
);
const { tableCols, checkedKeys, popVal, selectedRow } = useShopGarmentTable(
  false,
  userVirProds
);
const cols = computed(() =>
  tableCols.value.filter(
    (x: any) =>
      !["select", "userName", "vendorPrice", "stockCnt"].includes(x.key)
  )
);

const { search, searchedData, searchInputVal } = useSearch({
  data: userVirProds,
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return v === null
      ? true
      : x.size.includes(v) || x.color.includes(v) || x.prodName.includes(v);
  },
});

async function onCheckedOrder() {
  const orders: IoOrder[] = [];
  for (let i = 0; i < checkedKeys.value.length; i++) {
    const prod = virShopProds.value.find(
      (x) => x.shopProdId === checkedKeys.value[i]
    )!;
    if (!prod) continue;

    const vendorProd = virVendorProds.value.find(
      (y) => y.vendorProdId === prod.vendorProdId
    )!;
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
  await ORDER_GARMENT_DB.batchCreate(auth.currUser.userInfo.userId, orders);
  msg.success(
    `${orders.length} 개 상품 주문데이터 생성이 완료 되었습니다.`,
    makeMsgOpt()
  );
}
</script>
<template>
  <n-modal
    v-model:show="regitProdModal"
    :mask-closable="false"
    preset="card"
    title="도매 상품 등록"
    style="width: 80vw"
  >
    <vendor-garment-form
      :minimal="true"
      :virtual="true"
      @registered="onRegistered"
    />
  </n-modal>
  <n-card style="width: 100%">
    <template #header> 가상 상품관리 </template>
    <template #header-extra>
      <n-space>
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search"> 검색 </n-button>
        <n-button @click="changeRegitProdModal">가상 도매 상품등록</n-button>
        <n-button
          v-if="!isMobile()"
          size="small"
          round
          type="primary"
          @click="onCheckedOrder"
        >
          선택 상품 주문
        </n-button>
      </n-space>
    </template>
    <n-data-table
      :scroll-x="1200"
      :columns="cols"
      :data="searchedData"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <shop-prod-modify-modal
    v-if="popVal === 'Edit'"
    v-model:userProd="selectedRow"
    @on-close="selectedRow = null"
  />
</template>
