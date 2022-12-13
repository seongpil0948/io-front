<script setup lang="ts">
import {
  useSearch,
  ShopGarment,
  SHOP_GARMENT_DB,
  ShopVendorGarment,
  IoPartner,
  savePartner,
  loadPartner,
  VENDOR_GARMENT_DB,
  VendorGarment,
} from "@/composable/";
import { useShopStore, useAuthStore } from "@/store";
import { IoUser, getUserName } from "@io-boxies/js-lib";
import { useAlarm } from "@io-boxies/vue-lib";
import { NButton, useMessage } from "naive-ui";
import { storeToRefs } from "pinia";
import {
  ref,
  onBeforeMount,
  computed,
  watch,
  shallowRef,
  watchEffect,
} from "vue";

const msg = useMessage();
const auth = useAuthStore();
const shopStore = useShopStore();
const { shops } = storeToRefs(shopStore);
const { sendAlarm } = useAlarm();
onBeforeMount(async () => shopStore.setShops());
const targetShop = ref<IoUser | null>();
const shopProds = ref<ShopGarment[]>([]);
const partner = ref<IoPartner | null>(null);
async function updateShop(shopId: string) {
  console.log("updateShop: ", shopId);
  targetShop.value = await shopStore.getShop(shopId);
  if (!targetShop.value) return msg.error("존재하지 않는 유저입니다.");
  const param = {
    shopId,
    vendorId: auth.currUser.userInfo.userId,
  };
  shopProds.value = await SHOP_GARMENT_DB.getShopGarments(param);
  partner.value = await loadPartner(param);
}
async function onComplete(addedCredit: number) {
  msg.success("성공!");
  orderCnts.value = {};
  selectedData.value = [];
  if (partner.value) {
    console.info("addedCredit: ", addedCredit);
    partner.value.credit += addedCredit;
    await savePartner(partner.value);
  }
  await sendAlarm({
    toUserIds: [targetShop.value!.userInfo.userId],
    subject: `inoutbox 주문 처리내역 알림.`,
    body: `${getUserName(auth.currUser)} 에서 결제를 승인 하였습니다. `,
    notiLoadUri: "/",
    uriArgs: {},
  });
}
const shopOpts = computed(() =>
  shops.value.map((shop) => ({
    label: getUserName(shop),
    value: shop.userInfo.userId,
  }))
);

const vendorProds = shallowRef<VendorGarment[]>([]);
watchEffect(async () => {
  const ids = shopProds.value.map((x) => x.vendorProdId);
  vendorProds.value = await VENDOR_GARMENT_DB.listByIds(ids);
});
const products = computed(() => {
  const prods: ShopVendorGarment[] = [];
  for (let i = 0; i < shopProds.value.length; i++) {
    const shopGarment = shopProds.value[i];
    const vendorGarment = vendorProds.value.find(
      (x) => x.vendorProdId === shopGarment.vendorProdId
    )!;
    prods.push({ shopGarment, vendorGarment });
  }

  return prods;
});
const { search, searchedData, searchInputVal } = useSearch({
  data: products,
  filterFunc: (x, searchVal) => {
    const v: typeof searchVal = searchVal;
    return v === null
      ? true
      : x.vendorGarment.size.includes(v) ||
          x.vendorGarment.color.includes(v) ||
          x.vendorGarment.vendorProdName.includes(v) ||
          x.shopGarment.prodName.includes(v);
  },
});

const selectedData = ref<ShopVendorGarment[]>([]);
const orderCnts = ref<{ [vendorProdId: string]: number }>({});

function onClickProd(prod: ShopVendorGarment) {
  const idx = selectedData.value.findIndex(
    (x) => x.vendorGarment.vendorProdId === prod.vendorGarment.vendorProdId
  );
  if (idx === -1) {
    selectedData.value.push(prod);
  }
  if (orderCnts.value[prod.vendorGarment.vendorProdId]) {
    orderCnts.value[prod.vendorGarment.vendorProdId] += 1;
  } else {
    orderCnts.value[prod.vendorGarment.vendorProdId] = 1;
  }
}
const totalPrice = computed(() =>
  selectedData.value.reduce(
    (acc, curr) =>
      acc +
      curr.vendorGarment.vendorPrice *
        orderCnts.value[curr.vendorGarment.vendorProdId],
    0
  )
);
watch(
  () => orderCnts.value,
  (cnts) => {
    Object.keys(cnts).forEach((prodId) => {
      if (cnts[prodId] < 1) {
        delete cnts[prodId];
        const idx = selectedData.value.findIndex(
          (x) => x.vendorGarment.vendorProdId === prodId
        );
        if (idx > -1) {
          selectedData.value.splice(idx, 1);
        }
      }
    });
  },
  { deep: true }
);
</script>

<template>
  <n-space
    justify="space-around"
    inline
    style="height: 100%; min-height: 80vh; overflow: auto"
  >
    <n-card class="container" style="width: 25vw">
      <n-h3 class="center-txt">주문목록</n-h3>
      <n-space justify="end">
        <n-text v-if="partner"
          >미결제금액: {{ partner.credit.toLocaleString() }}</n-text
        ></n-space
      >
      <n-table>
        <thead>
          <tr>
            <th>품명</th>
            <th>주문량</th>
            <th>옵션</th>
            <th>재고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data, j) in selectedData" :key="j">
            <td>{{ data.vendorGarment.vendorProdName }}</td>
            <td>
              <n-input-number
                v-model:value="orderCnts[data.vendorGarment.vendorProdId]"
              />
            </td>
            <td>
              {{ data.vendorGarment.size }} / {{ data.vendorGarment.color }}
            </td>
            <td>
              {{
                data.vendorGarment.stockCnt -
                orderCnts[data.vendorGarment.vendorProdId]
              }}
            </td>
          </tr>
        </tbody>
      </n-table>
      <template #footer>
        <n-space v-if="targetShop && partner" justify="end" align="center">
          총계: <n-text type="info"> {{ totalPrice }}</n-text>
          <vendor-complete-pay-prod-button
            :target-shop="targetShop"
            :credit="partner.credit"
            :products="selectedData"
            :order-cnts="orderCnts"
            button-text="결제완료처리"
            @complete="onComplete"
          />
        </n-space>
      </template>
    </n-card>
    <n-card class="container" style="width: 100%">
      <template #header> 상품목록 </template>
      <template #header-extra>
        <n-select
          filterable
          style="width: 80%; margin-left: auto"
          placeholder="소매처 검색"
          :options="shopOpts"
          @update:value="updateShop"
        />
      </template>
      <n-space
        justify="end"
        inline
        style="
          width: 100%;
          margin-top: 0.5%;
          margin-bottom: 1%;
          min-width: 45vw;
        "
      >
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search"> 검색 </n-button>
      </n-space>
      <n-grid
        x-gap="12"
        y-gap="12"
        cols="1 s:2 m:2 l:3 xl:4"
        responsive="screen"
      >
        <n-gi v-for="(prod, i) in searchedData" :key="i">
          <n-card
            v-if="prod.vendorGarment"
            style="margin: auto; width: 190px; height: 120px; cursor: pointer"
            @click="onClickProd(prod)"
          >
            <n-space vertical>
              <n-text>{{ prod.vendorGarment.vendorProdName }}</n-text>
              <n-text type="info"
                >{{ prod.vendorGarment.size }} /
                {{ prod.vendorGarment.color }}</n-text
              >
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
  </n-space>
</template>

<style scoped>
.container {
  min-height: 400px;
}
</style>
