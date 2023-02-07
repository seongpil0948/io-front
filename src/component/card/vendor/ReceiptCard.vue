<script setup lang="ts">
import { formatDate, getUserName, IoUser, USER_DB } from "@io-boxies/js-lib";
import { toRefs, onBeforeUnmount, computed } from "vue";
import { useMessage } from "naive-ui";
import { OrderItem } from "@/composable";
import { useEditor } from "@/plugin/editor";
import { useAuthStore } from "@/store";
import { ioFireStore } from "@/plugin/firebase";

const props = defineProps<{
  customer?: IoUser | null;
  items: OrderItem[];
}>();
const { customer, items } = toRefs(props);
const msg = useMessage();
const auth = useAuthStore();
const u = auth.currUser();
const { toggleEditor, saveEditor, editor } = useEditor({
  readOnly: true,
  elementId: "io-editor",
  placeholder: "메모 입력",
  // data: prod.value!.info,
  data: u.orderMemo ?? {
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
async function onToggle() {
  // readonly로 바뀔때 상태 저장
  if (editor.value) {
    if (!editor.value.readOnly.isEnabled) {
      const orderMemo = await saveEditor();
      if (orderMemo) {
        u.orderMemo = orderMemo;
        await USER_DB.updateUser(ioFireStore, u);
        auth.setUser(u);
      }
    }
    await toggleEditor();
  }
}

onBeforeUnmount(async () => {
  onToggle();
  editor.value?.destroy();
});

function printReceipt() {
  const card = document.getElementById("receipt-card");
  const html = document.querySelector("html");
  if (!card || !html) return msg.error("다시 시도 해주세요.");
  const printContents = card.innerHTML;
  const printDiv = document.createElement("DIV");
  printDiv.id = "print-div";
  html.appendChild(printDiv);
  printDiv.innerHTML =
    `<h2 style="text-align: center;width: 100%;">영수증</h2>` + printContents;
  document.body.style.display = "none";
  window.print();
  document.body.style.display = "block";
  printDiv.style.display = "none";
}

const ordCnts = computed(() =>
  items.value.reduce((acc, curr) => acc + curr.orderCnt, 0).toLocaleString()
);
const taxs = computed(() =>
  items.value.reduce((acc, curr) => acc + curr.amount.tax, 0).toLocaleString()
);
const pureAmounts = computed(() =>
  items.value
    .reduce((acc, curr) => acc + curr.amount.pureAmount, 0)
    .toLocaleString()
);
const orderAmounts = computed(() =>
  items.value
    .reduce((acc, curr) => acc + curr.amount.orderAmount, 0)
    .toLocaleString()
);
const paidAmounts = computed(() =>
  items.value
    .reduce((acc, curr) => acc + curr.amount.paidAmount, 0)
    .toLocaleString()
);
const credits = computed(() =>
  items.value
    .reduce(
      (acc, curr) => acc + (curr.amount.orderAmount - curr.amount.paidAmount),
      0
    )
    .toLocaleString()
);

defineExpose({ printReceipt });
</script>
<template>
  <n-card title="주문 영수증">
    <template #header-extra>
      <n-space justify="end">
        <n-button @click="printReceipt">출력하기</n-button>
        <n-button @click="onToggle">편집모드</n-button>
      </n-space>
    </template>
    <div id="receipt-card">
      <n-divider class="black-divider" />
      <n-space justify="center">
        <n-space vertical>
          <n-text> {{ formatDate(new Date(), "MIN") }}</n-text>
          <n-h2>{{ getUserName(u) }}</n-h2>
          <n-h2 v-if="customer">{{ getUserName(customer) }} 귀하</n-h2>
        </n-space>

        <img
          style="width: 10vw"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
        />
      </n-space>
      <n-divider class="black-divider" />
      <n-space vertical align="center" item-style="width: 100%">
        <div id="io-editor" />
        <n-table :bordered="true" :single-line="false" size="small">
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
          <n-text type="info">수량합계</n-text><n-text>{{ ordCnts }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">부가세</n-text><n-text>{{ taxs }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">상품금액 합계</n-text
          ><n-text>{{ pureAmounts }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">총 결제 금액</n-text>
          <n-text>{{ orderAmounts }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">받은 금액</n-text
          ><n-text>{{ paidAmounts }}</n-text>
        </n-space>
        <n-space justify="space-between">
          <n-text type="info">미결제 금액</n-text><n-text>{{ credits }}</n-text>
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

@media print {
  #print-div {
    /* zoom: 850%; */
    zoom: 250%;
    margin-bottom: 120px;
  }
  #print-div * {
    /* font-size: 1px; */
    font-size: 5px;
    font-weight: 900 !important;
    color: black !important;
    margin: 0;
    padding: 0;
    border-width: 0.01px;
  }
  #print-div .n-text {
    color: black !important;
    font-weight: 900 !important;
  }
  #print-div .n-space {
    gap: 2px 4px !important;
  }
  #print-div img {
    width: 10px !important;
  }
  #print-div th {
    padding: 2px;
  }
  #print-div td {
    padding: 1px;
  }
  #print-div .n-table {
    border-radius: 0;
    color: black !important;
    font-weight: 900 !important;
  }
}
#print-div #io-editor {
  margin-top: 10px;
  margin-bottom: 20px;
}
#print-div .codex-editor__redactor {
  padding-bottom: 0 !important;
}
</style>
