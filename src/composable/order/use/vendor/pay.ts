import { PAY_METHOD, getOrderAmount, getTax, OrderItem } from "@/composable";
import { ref, Ref, computed } from "vue";
import type ReceiptCard from "@/component/card/vendor/ReceiptCard.vue";
import { useMessage } from "naive-ui";

export interface CompleteParam {
  items: Ref<OrderItem[]>;
}
export function useCompletePay(param: CompleteParam) {
  const { items } = param;
  const msg = useMessage();
  const payMethod = ref<PAY_METHOD>("CASH");
  const showModal = ref(false);
  const tax = ref(false);
  const paidAmount = ref(0);
  const orderAmounts = computed(() =>
    items.value.reduce((acc, curr) => {
      if (tax.value) {
        acc += getOrderAmount(
          Object.assign(
            {},
            { ...curr.amount },
            { tax: getTax(curr.amount.orderAmount) }
          )
        );
      } else {
        acc += curr.amount.orderAmount;
      }
      return acc;
    }, 0)
  );

  const receiptRef = ref<typeof ReceiptCard | null>(null);
  function onPrint() {
    if (!receiptRef.value) return msg.error("다시 시도");
    receiptRef.value.printReceipt();
  }

  return {
    payMethod,
    showModal,
    tax,
    paidAmount,
    orderAmounts,
    receiptRef,
    onPrint,
  };
}
