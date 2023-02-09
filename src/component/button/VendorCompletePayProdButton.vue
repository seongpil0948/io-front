<script setup lang="ts">
import {
  OrderItem,
  newOrdItem,
  newOrdFromItem,
  useCompletePay,
  ShopVendorGarment,
  ORDER_GARMENT_DB,
  setItemCnt,
} from "@/composable";
import { uuidv4 } from "@firebase/util";
import { toRefs, watch, ref } from "vue";
import { Size, Type } from "naive-ui/es/button/src/interface";
import type ReceiptCard from "@/component/card/vendor/ReceiptCard.vue";
import { IoUser } from "@io-boxies/js-lib";

const props = defineProps<{
  products: ShopVendorGarment[];
  targetShop: IoUser;
  credit: number;
  buttonText: string;
  orderCnts: { [vendorProdId: string]: number };
  buttonClass?: string;
  isText?: boolean;
  type?: Type;
  size?: Size;
}>();
const { products, orderCnts } = toRefs(props);
const emits = defineEmits<{
  (e: "complete", value: number): void;
}>();

const items = ref<OrderItem[]>([]);
watch(
  () => products.value,
  (prods) => {
    items.value = [];
    for (let i = 0; i < prods.length; i++) {
      const prod = prods[i];
      const orderCnt = orderCnts.value[prod.vendorGarment.vendorProdId];
      console.log("orderCnt:", orderCnt);
      if (orderCnt > 0) {
        const item = newOrdItem({
          vendorProd: prod.vendorGarment,
          shopProd: prod.shopGarment,
          orderIds: [uuidv4()],
          orderCnt,
          shipFeeAmount: 0,
          shipFeeDiscountAmount: 0,
          pickFeeAmount: 0,
          pickFeeDiscountAmount: 0,
          tax: 0,
          paidAmount: 0,
          paid: "NO",
          paymentConfirm: false,
          state: "BEFORE_READY",
        });
        items.value.push(item);
      }
    }
  },
  { deep: true }
);
watch(
  () => orderCnts.value,
  function (cnts) {
    items.value.forEach((item) => {
      const vProdId = item.vendorProd.vendorProdId;
      const prod = products.value.find(
        (x) => x.vendorGarment.vendorProdId === vProdId
      );
      if (prod) {
        setItemCnt(
          item,
          cnts[vProdId],
          prod.vendorGarment.stockCnt,
          prod.vendorGarment.allowPending,
          false,
          item.prodAmount.paid
        );
      }
      if (!showModal.value) {
        defrayInfo.value[item.id].paidAmount = item.prodAmount.amount;
      }
    });
  },
  { deep: true }
);
async function completePay() {
  const c = newCredit.value;
  const order = newOrdFromItem([...items.value]);
  await ORDER_GARMENT_DB.updateOrder(order);
  emits("complete", c);
  showModal.value = false;
  items.value = [];
}

const { showModal, defrayInfo, prodAmounts, receiptRef, newCredit } =
  useCompletePay({
    items,
  });
</script>

<template>
  <n-button
    :size="size"
    :type="type"
    :text="isText"
    :class="buttonClass"
    @click="showModal = true"
    >{{ buttonText }}</n-button
  >
  <n-modal
    v-model:show="showModal"
    style="width: 90vw"
    preset="card"
    size="huge"
  >
    <n-space justify="space-around">
      <ReceiptCard ref="receiptRef" :customer="targetShop" :items="items" />
      <n-space v-if="showModal" vertical>
        <n-card>
          <n-space justify="space-between">
            <n-text>총 결제 금액: </n-text>
            <n-text type="info">{{ prodAmounts.toLocaleString() }} </n-text>
          </n-space>
          <n-space justify="space-between">
            <n-text>추가 미 결제금액: </n-text>
            <n-text type="info">{{ newCredit.toLocaleString() }} </n-text>
          </n-space>
          <template #footer>
            <n-space justify="end">
              <n-button
                @click="
                  () => ($refs as any).defrayCards.forEach((e: any) => e.applyTax(true))
                "
                >부가세적용</n-button
              >
              <n-button @click="completePay">주문확정</n-button>
            </n-space>
          </template>
        </n-card>
        <div v-for="(item, i) in items" :key="i">
          <defray-info-card
            ref="defrayCards"
            v-model:defray.lazy="defrayInfo[item.id]"
            v-model:item.lazy="items[i]"
          />
        </div>
      </n-space>
    </n-space>
  </n-modal>
</template>
