<script setup lang="ts">
import { formatDate, getUserName, IoUser } from "@io-boxies/js-lib";
import { Instagram } from "@vicons/fa";
import { toRefs } from "vue";
import { useMessage } from "naive-ui";

const props = defineProps<{
  customer?: IoUser | null;
  vendor: IoUser;
}>();
const { customer, vendor } = toRefs(props);
const msg = useMessage();

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

defineExpose({ printReceipt });
</script>
<template>
  <n-card id="receipt-card">
    <n-space vertical align="end">
      <n-text> {{ formatDate(new Date(), "MIN") }}</n-text>
      <n-text v-if="customer"> {{ getUserName(customer) }} 귀하 </n-text>
    </n-space>
    <n-divider class="black-divider" />
    <n-h2 class="center-txt">{{ getUserName(vendor) }}</n-h2>
    <n-h4 class="center-txt">주문 영수증</n-h4>
    <n-divider class="black-divider" />
    <n-space vertical align="start" item-style="width: 100%">
      <n-text>hp: 010-7184-0948</n-text>
      <n-text>tel: 010-7727-7428</n-text>
      <n-text>kakao: fuckjunhai</n-text>
      <n-text><n-icon :component="Instagram" />: fuckjunhai</n-text>
      <n-text
        >메모: <br />메모 메모 항헹홍행홍 <br />메모 메모 항헹홍행홍 <br />메모
        메모 항헹홍행홍
      </n-text>
      <n-space vertical align="center">
        <img
          style="width: 20vw"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
        />
        <table>
          <thead>
            <tr>
              <th colspan="2">The table header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>The table body</td>
              <td>with two columns</td>
            </tr>
            <tr>
              <td>The table body</td>
              <td>with two columns</td>
            </tr>
            <tr>
              <td>The table body</td>
              <td>with two columns</td>
            </tr>
          </tbody>
        </table>
      </n-space>

      <n-divider class="black-divider" />
      <n-space justify="space-between">
        <n-text type="info">수량합계</n-text><n-text>15</n-text>
      </n-space>
      <n-space justify="space-between">
        <n-text type="info">부가세</n-text><n-text>5,000</n-text>
      </n-space>
      <n-space justify="space-between">
        <n-text type="info">금액 합계</n-text><n-text>75,000</n-text>
      </n-space>
      <n-space justify="space-between">
        <n-text type="info">미결제 금액</n-text><n-text>120,000</n-text>
      </n-space>
      <n-space justify="space-between">
        <n-text type="info">총 결제 금액</n-text><n-text>200,000</n-text>
      </n-space>
      <n-divider class="black-divider" />
    </n-space>
  </n-card>
</template>

<style>
#receipt-card {
  width: 45vw;
  height: 80vh;
  overflow: auto;
}
.black-divider {
  border-top: 1px solid black;
}
</style>
