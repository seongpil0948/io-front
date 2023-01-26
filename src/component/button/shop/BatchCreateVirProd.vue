<script setup lang="ts">
import {
  ProdInnerIdSrc,
  ShopGarment,
  ShopUserGarment,
  useFileReader,
  useMapper,
  reverseMapping,
  mapTxt,
} from "@/composable";
import { useExcel } from "@/plugin/xlsx";
import { getUserName, IoUser } from "@io-boxies/js-lib";
import { NButton } from "naive-ui";
import { ref, computed, h, shallowRef, toRefs, triggerRef } from "vue";
import { utils } from "xlsx";

type PartialInner = Partial<ProdInnerIdSrc>;
interface ParseData {
  vendorName?: string;
  in: PartialInner;
  ex: Omit<PartialInner, "vendorId" | "vendorName">;
  info?: ReturnType<typeof getStatusInfo>;
}
const props = defineProps<{
  data: ShopUserGarment[];
  userId: string;
  vendorByName: { [uName: string]: IoUser };
}>();
const { data, userId, vendorByName } = toRefs(props);
const emits = defineEmits<{
  (e: "select", value: ParseData): void;
}>();

const dictData = computed(() =>
  data.value.reduce((acc, curr) => {
    acc[ShopGarment.innerId(curr)] = curr;
    return acc;
  }, {} as { [k: string]: ShopUserGarment })
);

const { mapper } = useMapper(userId.value);
const inputRef = shallowRef<null | HTMLInputElement>(null);
// const {msg} = useCommon()
const { readExcel, dataSlice, msg } = useExcel();

const jsonData = ref<ParseData[]>([]);
const parseData = shallowRef<ParseData[]>([]);
function reset() {
  parseData.value = [];
  jsonData.value = [];
}
function processJson() {
  parseData.value = [];
  for (let i = 0; i < jsonData.value.length; i++) {
    const j = jsonData.value[i];
    if (j.vendorName) {
      const vendor = vendorByName.value[j.vendorName];
      if (vendor) {
        j.vendorName = getUserName(vendor);
        j.in.vendorId = vendor.userInfo.userId;
      }
    }
    j.info = getStatusInfo(getStatus(j));
    parseData.value.push(j);
  }
  triggerRef(parseData);
  console.info("processJson parseData: ", parseData);
}

function readJson(json: any[]) {
  const pd: ParseData[] = [];
  for (let z = 0; z < json.length; z++) {
    const j = json[z];
    const data = {} as { [kk: string]: string };
    Object.keys(j).forEach((k) => (data[mapTxt(k)] = j[k]));
    const getFVal = (k: string) => {
      const d = mapTxt(String(data[k] ?? ""));
      return d.length < 1 ? undefined : d;
    };
    pd.push({
      vendorName: getFVal("가상도매명"),
      in: {
        prodName: getFVal("가상상품명"),
        color: getFVal("컬러") ?? "기본",
        size: getFVal("사이즈"),
      },
      ex: {
        prodName: getFVal("판매상품명"),
        color: getFVal("판매컬러"),
        size: getFVal("판매사이즈"),
      },
    });
  }
  return pd;
}
const { progress, handleFileChange } = useFileReader({
  inputRef,
  readMethod: "binary",
  beforeRead: reset,
  onLoad: async (event) => {
    const result = event.target?.result;
    const workBook = readExcel(result);

    for (let i = 0; i < Object.keys(workBook.Sheets).length; i++) {
      const sheetName = Object.keys(workBook.Sheets)[i];
      const sheet = workBook.Sheets[sheetName];
      dataSlice(sheet, 0);
      const json = utils.sheet_to_json(sheet, { defval: "" });
      console.log(`<<< after sheet: `, sheet, "json: ", json, " <<<");
      if (!Array.isArray(json)) {
        console.warn(`sheet: ${sheetName} is not array: `, json);
        msg.warning(`sheet: ${sheetName} 실패.`);
        continue;
      }
      jsonData.value.push(...readJson(json));
      //   const worksheet = utils.json_to_sheet(json);
      //   const workbook = utils.book_new();
      //   utils.book_append_sheet(workbook, worksheet, "Dates");
      //   writeFile(workbook, "zzzzz.xlsx");
    }
    processJson();
    progress.value.proceed += 1;
    showParseModal.value = true;
  },
});

async function processAll() {
  if (!mapper.value) return msg.error("매핑정보를 불러 올 수 없습니다.");
  let mappedCnt = 0;
  for (let k = 0; k < parseData.value.length; k++) {
    const d = parseData.value[k];
    const status = getStatus(d);
    if (!status.innerId) continue;
    else if (status.shopProd && status.mappable) {
      await reverseMapping(
        mapper.value,
        {
          inputProdName: d.ex.prodName!,
          inputColor: d.ex.color!,
          inputSize: d.ex.size!,
        },
        status.shopProd
      );
      mappedCnt += 1;
    }
  }
  msg.success(`${mappedCnt}건의 매핑작업 성공`);
  showParseModal.value = false;
}

const showParseModal = shallowRef(false);
const onClick = () => inputRef.value?.click();
function getStatus(row: ParseData) {
  const innerId =
    row.in.vendorId && row.in.prodName && row.in.color && row.in.size
      ? ShopGarment.innerId(row.in as ProdInnerIdSrc)
      : null;
  const shopProd =
    innerId !== null
      ? ShopGarment.fromJson(dictData.value[innerId]) ?? undefined
      : undefined;
  if (!dictData.value[innerId ?? ""])
    console.log(`inner id(${innerId}) not exist in shop dict, row:`, row);

  const filled = row.ex.prodName && row.ex.color && row.ex.size;
  const mappable = shopProd && filled && row.vendorName && row.in.vendorId;
  const selectable = !shopProd && filled;
  return { innerId, mappable, selectable, shopProd };
}
const statusText = {
  fail: {
    // in, ex 둘다 없는경우
    type: "error",
    txt: "실패",
  },
  select: {
    // ex 전부 채워진경우 in 이없을경우
    type: "info",
    txt: "상품선택",
  },
  mappable: {
    // ex 전부 채워진경우 상품이 존재 할때
    type: "default",
    txt: "매핑완료",
  },
};
function getStatusInfo(s: ReturnType<typeof getStatus>) {
  if (s.mappable) return statusText.mappable;
  else if (s.selectable) return statusText.select;
  else return statusText.fail;
}
defineExpose({ processJson });
const cols = computed(() => [
  {
    title: "상태",
    key: "status",
    filter(value: string, row: ParseData) {
      return row.info?.txt === value;
    },
    filterOptions: [
      {
        label: "상품선택",
        value: "상품선택",
      },
      {
        label: "실패",
        value: "실패",
      },
      {
        label: "매핑완료",
        value: "매핑완료",
      },
    ],
    render(row: ParseData) {
      return h(
        NButton,
        {
          strong: true,
          type: row.info
            ? (row.info.type as "default" | "info" | "error")
            : "default",
          text: true,
          disabled: row.info?.txt !== "상품선택",
          size: "small",
          onClick: () => {
            if (row.info?.txt === "상품선택") {
              emits("select", row); // fill in property
            }
          },
        },
        {
          default: () => row.info?.txt,
        }
      );
    },
  },
  {
    title: "도매처",
    key: "vendorName",
  },
  ...["in", "ex"].map((x) => ({
    title: x === "in" ? "가상 상품 정보" : "불러온 상품 정보",
    key: x,
    children: [
      {
        title: "상품명",
        key: `${x}.prodName`,
      },
      {
        title: "컬러",
        key: `${x}.color`,
      },
      {
        title: "사이즈",
        key: `${x}.size`,
      },
    ],
  })),
]);
</script>
<template>
  <input
    id="customFile"
    ref="inputRef"
    style="display: none"
    type="file"
    @change.stop.prevent="handleFileChange"
  />
  <n-button @click="onClick"> 엑셀 일괄등록 </n-button>
  <n-modal v-model:show="showParseModal" style="margin: 5%">
    <n-card title="파싱 프리뷰">
      <template #header-extra>
        <router-link to="/cs/home" #="{ navigate, href }" custom>
          <n-a :href="href" @click="navigate"> 실패된 매핑 자세히 보기 </n-a>
        </router-link>
      </template>
      <n-data-table
        :data="parseData"
        :columns="cols"
        :single-line="false"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
      />
      <template #action>
        <n-space justify="end">
          <n-button @click="processAll"> 생성 및 매핑 </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>
