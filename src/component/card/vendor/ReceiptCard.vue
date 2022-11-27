<script setup lang="ts">
import { formatDate, getUserName, IoUser } from "@io-boxies/js-lib";
import { toRefs, watch, ref, computed } from "vue";
import { useMessage } from "naive-ui";
import { OrderItem } from "@/composable";
import { useEditor } from "@/plugin/editor";

const props = defineProps<{
  customer?: IoUser | null;
  vendor: IoUser;
  items: OrderItem[];
}>();
const { customer, vendor, items } = toRefs(props);
const msg = useMessage();

const { toggleEditor } = useEditor({
  readOnly: true,
  elementId: "io-editor",
  placeholder: "메모 입력",
  // data: prod.value!.info,
  data: {
    blocks: [
      {
        type: "paragraph",
        data: {
          text: "메모 입력",
        },
      },
    ],
  },
});

function printReceipt() {
  const card = document.getElementById("receipt-card");
  const html = document.querySelector("html");
  if (!card || !html) return msg.error("다시 시도 해주세요.");
  const printContents = card.innerHTML;
  const printDiv = document.createElement("DIV");
  printDiv.className = "print-div";

  html.appendChild(printDiv);
  printDiv.innerHTML = printContents;
  document.body.style.display = "none";
  window.print();
  document.body.style.display = "block";
  printDiv.style.display = "none";
}

const cntObj = ref<{ [k: string]: number }>({
  orderCnt: 0,
  tax: 0,
  pureAmount: 0,
  paidAmount: 0,
  credit: 0,
  orderAmount: 0,
});

watch(
  () => items.value,
  (is) => {
    Object.keys(cntObj.value).forEach((k) => {
      cntObj.value[k] = 0;
    });
    is.forEach((item) => {
      cntObj.value.orderCnt += item.orderCnt;
      cntObj.value.tax += item.amount.tax;
      cntObj.value.pureAmount += item.amount.pureAmount;
      cntObj.value.orderAmount += item.amount.orderAmount;
    });
    cntObj.value.credit = cntObj.value.orderAmount - cntObj.value.paidAmount;
  },
  {
    deep: true,
  }
);

defineExpose({ printReceipt });
</script>
<template>
  <n-card title="주문 영수증">
    <template #header-extra>
      <n-space justify="end">
        <n-button @click="printReceipt">출력하기</n-button>
        <n-button @click="toggleEditor">편집모드</n-button>
      </n-space>
    </template>
    <div id="receipt-card">
      <n-divider class="black-divider" />
      <n-space justify="space-between">
        <n-space vertical>
          <n-text> {{ formatDate(new Date(), "MIN") }}</n-text>
          <n-h2>{{ getUserName(vendor) }}</n-h2>
          <n-h2 v-if="customer">{{ getUserName(customer) }} 귀하</n-h2>
        </n-space>

        <img
          style="width: 10vw"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
        />
      </n-space>
      <n-divider class="black-divider" />
      <n-space vertical align="center" item-style="width: 100%">
        <div id="io-editor" class="io-editor-border" />
        <n-table :bordered="false" :single-line="false" size="small">
          <thead>
            <tr>
              <th>품목</th>
              <th>옵션</th>
              <th>수량</th>
              <th>단가</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in items" :key="i">
              <td>{{ item.vendorProd.vendorProdName }}</td>
              <td>{{ item.vendorProd.size }} / {{ item.vendorProd.color }}</td>
              <td>{{ item.orderCnt }}</td>
              <td>{{ item.vendorProd.vendorPrice }}</td>
            </tr>
          </tbody>
        </n-table>

        <n-divider class="black-divider" />
        <n-space justify="space-between">
          <n-text type="info">수량합계</n-text
          ><n-text>{{ cntObj.orderCnt.toLocaleString() }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">부가세</n-text
          ><n-text>{{ cntObj.tax.toLocaleString() }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">금액 합계</n-text
          ><n-text>{{ cntObj.pureAmount.toLocaleString() }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">미결제 금액</n-text
          ><n-text>{{ cntObj.credit.toLocaleString() }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">총 결제 금액</n-text
          ><n-text>{{ cntObj.orderAmount.toLocaleString() }}</n-text>
        </n-space>
        <n-divider class="black-divider" />
      </n-space>
    </div>
  </n-card>
</template>

<style>
#receipt-card {
  width: 45vw;
  min-height: 60vh;
  overflow: auto;
}
.black-divider {
  border-top: 1px solid black;
}
</style>
