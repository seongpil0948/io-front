<script setup lang="ts">
import { mapTxt, useFileReader } from "@/composable";
import { useExcel } from "@/plugin/xlsx";
import { ref } from "vue";
import { utils, writeFile } from "xlsx";

const inputRef = ref<null | HTMLInputElement>(null);
const { readExcel, dataSlice, msg } = useExcel();
const { progress, handleFileChange } = useFileReader({
  inputRef,
  readMethod: "binary",
  onLoad: async (event, file) => {
    const result = event.target?.result;
    const workBook = readExcel(result);
    for (let i = 0; i < Object.keys(workBook.Sheets).length; i++) {
      const sheetName = Object.keys(workBook.Sheets)[i];
      const sheet = workBook.Sheets[sheetName];
      // dataSlice(sheet, 0);
      const defval = "";
      const jsonArr = utils.sheet_to_json<any[]>(sheet, { header: 1, defval });
      if (!Array.isArray(jsonArr))
        return console.warn(`sheet: ${sheetName} is not array: `, jsonArr);
      console.log(`<<< after sheet: `, sheet, "json: ", jsonArr, " <<<");

      const targetCols = [
        "상품주문번호",
        "구매자명",
        "상품명",
        "옵션정보",
        "주문번호",
      ];
      const excelInfo = {
        startRow: -1,
        colIdx: {} as { [kk: string]: number },
      };

      for (let z = 0; z < jsonArr.length; z++) {
        const rowArr = jsonArr[z];
        if (!Array.isArray(rowArr)) throw Error("fuck u");
        const cleanRow = rowArr.map((c) => mapTxt(String(c)));
        if (targetCols.every((t) => cleanRow.includes(t))) {
          excelInfo.startRow = z;
          for (let q = 0; q < targetCols.length; q++) {
            const target = targetCols[q];
            excelInfo.colIdx[target] = cleanRow.findIndex((c) => c === target);
          }
          break;
        }
      }
      if (excelInfo.startRow > -1) {
        const cleanArr: string[][] = [];
        for (let z = excelInfo.startRow; z < jsonArr.length; z++) {
          const rowArr = jsonArr[z];
          const arr: string[] = [];
          targetCols.forEach((c) => arr.push(rowArr[excelInfo.colIdx[c]]));
          cleanArr.push(arr);
        }
        console.info("===> this is clean Array: ", cleanArr);
      } else {
        msg.error(
          `${file.name}-${sheetName} 시트는 컬럼을 찾지 못하여 스킵 되었습니다.`,
          { duration: 5000 }
        );
      }
      console.info("excelInfo: ", excelInfo);

      // const worksheet = utils.json_to_sheet(json);
      // const workbook = utils.book_new();
      // utils.book_append_sheet(workbook, worksheet, "Dates");
      // writeFile(workbook, "zzzzz.xlsx");

      // const userId = "required"
      // virtual.value
      //   ? createVirVendorGarments(userId, products)
      //   : VENDOR_GARMENT_DB.batchCreate(userId, products);
    }
    progress.value.proceed += 1;
  },
  beforeRead: function (): void {},
});

// function readTestTable() {
//   const el = document.getElementById("test-table");
//   if (!el) return;
//   // const el = testTableRef.value.getElementsByTagName("table"[0]);
//   console.info("test tables el: ", el);
//   // const wb = utils.table_to_book(el);
//   const sheet = utils.table_to_sheet(el);
//   console.log("test table sheet: ", sheet);
// }
</script>

<template>
  <n-space vertical justify="center" align="center">
    <n-h1>Play Ground</n-h1>
    <n-card style="width: 90vw">
      <n-space vertical justify="center" align="center">
        <n-space vertical>
          <n-text> 파일처리 현황: {{ progress.proceed }} /</n-text>
          <n-progress type="circle" :percentage="progress.percent" />
        </n-space>
        <!-- <test-table id="test-table" /> -->

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
        <!-- <n-button @click="readTestTable"> readTestTable </n-button> -->
        <!-- <test-data-table id="test-data-table" /> -->
      </n-space>
    </n-card>
  </n-space>
</template>
