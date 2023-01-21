<script setup lang="ts">
import { useFileReader } from "@/composable";
import { useExcel } from "@/plugin/xlsx";
import { ref } from "vue";
import { utils, writeFile } from "xlsx";

const inputRef = ref<null | HTMLInputElement>(null);
const { readExcel, dataSlice } = useExcel();
const { progress, fileModel, handleFileChange } = useFileReader({
  inputRef,
  readMethod: "binary",
  onLoad: (event) => {
    const result = event.target?.result;
    const workBook = readExcel(result);
    for (let i = 0; i < Object.keys(workBook.Sheets).length; i++) {
      const sheetName = Object.keys(workBook.Sheets)[i];
      const sheet = workBook.Sheets[sheetName];
      dataSlice(sheet, 0);
      const defaultVal = "";
      const json = utils.sheet_to_json(sheet, { defval: defaultVal });
      // result of above: [{
      //     번호: 1,
      //     결제일자: 220825,
      //     주문번호: "b-8250111111111",
      //     주문상세번호: "b-82501011111111",
      //     상품번호: "pt1",
      //     옵션상품번호: "pt1-1",
      //     상품명: "브데일리 청바지",
      //     옵션정보: "연청 s",
      //     "상품 판매가": 10000,
      //     수량: 1,
      //     주문자명: "김바보",
      //     핸드폰번호: "010-7727-7428",
      //     수령자명: "김바보",
      //     수령자연락처: "010-5882-7469",
      //   },
      //   ...
      // ];
      if (!Array.isArray(json)) {
        return console.warn(`sheet: ${sheetName} is not array: `, json);
      }
      console.log(`<<< after sheet: `, sheet, "json: ", json, " <<<");

      for (let z = 0; z < json.length; z++) {
        const j = json[z];
        const data = {} as { [kk: string]: string };
        const getFVal = (k: string) => String(data[k] ?? defaultVal);
        Object.keys(j).forEach((k) => (data[k.replace(/\s/g, "")] = j[k]));
        const inVProdName = getFVal("도매상품명");
        const inVColor = getFVal("도매컬러");
        const inVSize = getFVal("도매사이즈");
        const inProdName = getFVal("사이즈");
        const inColor = getFVal("컬러");
        const inSize = getFVal("판매상품명");
        console.info(`
          도매상품명: ${inVProdName}, 도매컬러: ${inVColor}, 도매사이즈: ${inVSize},
          판매상품명: ${inProdName}, 컬러: ${inColor}, 사이즈: ${inSize},`);
      }

      const worksheet = utils.json_to_sheet(json);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Dates");
      writeFile(workbook, "zzzzz.xlsx");

      // const userId = "required"
      // virtual.value
      //   ? createVirVendorGarments(userId, products)
      //   : VENDOR_GARMENT_DB.batchCreate(userId, products);
    }
    progress.value.proceed += 1;
  },
  beforeRead: function (): void {
    throw new Error("Function not implemented.");
  },
});

function readTestTable() {
  const el = document.getElementById("test-table");
  if (!el) return;
  // const el = testTableRef.value.getElementsByTagName("table"[0]);
  console.info("test tables el: ", el);
  // const wb = utils.table_to_book(el);
  const sheet = utils.table_to_sheet(el);
  console.log("test table sheet: ", sheet);
}
</script>

<template>
  <n-space vertical justify="center" align="center">
    <n-h1>Play Ground</n-h1>
    <n-card style="width: 90vw">
      <n-space vertical justify="center" align="center">
        <n-space v-if="fileModel" vertical>
          <n-text>
            파일처리 현황: {{ progress.proceed }} /
            {{ fileModel.length }}</n-text
          >
          <n-progress type="circle" :percentage="progress.percent" />
        </n-space>
        <test-table id="test-table" />

        <!-- <button type="button" @click="xport">
          Export with SheetJS version {{ version }}
        </button> -->
        <n-button @click="inputRef?.click()">
          <input
            id="customFile"
            ref="inputRef"
            style="display: none"
            multiple
            type="file"
            @change="handleFileChange"
          />
          read file
        </n-button>
        <n-button @click="readTestTable"> readTestTable </n-button>
        <test-data-table id="test-data-table" />
      </n-space>
    </n-card>
  </n-space>
</template>
