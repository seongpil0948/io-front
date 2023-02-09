import { OrderItem, DefrayParam } from "@/composable";
import { ref, Ref, computed, watch } from "vue";
import type ReceiptCard from "@/component/card/vendor/ReceiptCard.vue";
import { useMessage } from "naive-ui";

export interface CompleteParam {
  items: Ref<OrderItem[]>;
}
export function useCompletePay(param: CompleteParam) {
  const { items } = param;
  const msg = useMessage();
  const showModal = ref(false);
  const defrayInfo = ref<{
    [itemId: string]: DefrayParam;
  }>({});

  watch(
    () => items.value,
    (orderItems, prev) => {
      if (prev.length !== orderItems.length) {
        defrayInfo.value = orderItems.reduce((acc, curr) => {
          acc[curr.id] = {
            paidAmount: curr.prodAmount.amount,
            payMethod: "CASH",
            tax: 0,
          };
          return acc;
        }, {} as typeof defrayInfo.value);
      }
    },
    { deep: true }
  );

  const prodAmounts = computed(() =>
    items.value.reduce((acc, curr) => acc + curr.prodAmount.amount, 0)
  );

  const newCredit = computed(
    () =>
      prodAmounts.value -
      items.value.reduce((acc, curr) => acc + curr.prodAmount.paidAmount, 0)
  );
  const receiptRef = ref<typeof ReceiptCard | null>(null);
  function onPrint() {
    if (!receiptRef.value) return msg.error("다시 시도");
    receiptRef.value.printReceipt();
  }

  return {
    showModal,
    defrayInfo,
    prodAmounts,
    receiptRef,
    onPrint,
    newCredit,
  };
}
