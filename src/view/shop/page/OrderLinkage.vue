<script setup lang="ts">
import {
  catchError,
  useApiTokenCols,
  useMatch,
  useShopVirtualProd,
} from "@/composable";
import { ref } from "vue";
import _axios from "@/plugin/axios";
import { useAuthStore } from "@/store";

const auth = useAuthStore();
const { virVendorProds, userVirProds } = useShopVirtualProd(auth.currUser());
const {
  range,
  updateRangeNaive,
  timeFormat,
  goAuthorizeCafe,
  mallId,
  onGetOrder,
  onSaveMatch,
  tableCols,
  openSelectList,
  tokens,
  matchCols,
  useMatching,
  useMapping,
  showMatchModal,
  search,
  searchedData,
  searchInputVal,
  switchFilter,
  filteredMatchData,
  filterIsNull,
  uid,
  msg,
} = useMatch({ virVendorProds, userVirProds });
const { apiTokenCol } = useApiTokenCols();

const showRegitZig = ref(false);
function onZigSubmit() {
  showRegitZig.value = false;
}
const showRegitAbly = ref(false);
async function onAblySubmit(ip: { id: string; pw: string }) {
  const formData = new FormData();
  formData.set("userId", uid.value);
  formData.set("email", ip.id);
  formData.set("password", ip.pw);
  return _axios
    .post(`/linkage/saveAblyToken`, formData)
    .then((saveRes) => {
      msg.success("등록 성공");
      console.log("saveRes: ", saveRes);
    })
    .catch((err) => catchError({ msg, uid: uid.value, err }))
    .finally(() => (showRegitAbly.value = false));
}
</script>

<template>
  <n-space vertical>
    <n-card title="주문연동">
      <n-space vertical>
        <n-space>
          <n-h5 style="text-align: start">
            주문내역 일자 범위선택 (1개월이내)
          </n-h5>
          <n-date-picker
            v-model:value="range"
            type="daterange"
            start-placeholder="부터"
            end-placeholder="까지"
            :format="timeFormat"
            clearable
            @update:formatted-value="updateRangeNaive"
          />
        </n-space>

        <n-space>
          <n-button @click="onGetOrder"> 취합 </n-button>
          <n-popover trigger="click">
            <template #trigger>
              <n-button> 카페24 연동 </n-button>
            </template>
            <n-h5 style="width: 100%; text-align: start"> 쇼핑몰 ID 입력 </n-h5>
            <n-space vertical align="end">
              <n-input v-model:value="mallId" />
              <n-button @click="goAuthorizeCafe"> 연동하기 </n-button>
            </n-space>
          </n-popover>
          <n-popover v-model:show="showRegitZig" trigger="click">
            <template #trigger>
              <n-button> 지그재그 연동 </n-button>
            </template>
            <zigzag-register-api-form @submit-token="onZigSubmit" />
          </n-popover>
          <n-popover v-model:show="showRegitAbly" trigger="click">
            <template #trigger>
              <n-button> 에이블리 연동 </n-button>
            </template>
            <id-pw-form @submit="onAblySubmit" />
          </n-popover>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-checkbox v-model:checked="useMatching"> 수동 취합 </n-checkbox>
            </template>
            지원가능 서비스: 전체
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-checkbox v-model:checked="useMapping"> 매핑 취합 </n-checkbox>
            </template>
            지원가능 서비스: 카페24
          </n-tooltip>
        </n-space>
      </n-space>
    </n-card>
  </n-space>
  <n-h2>API 계정 관리</n-h2>
  <n-data-table :columns="apiTokenCol" :data="tokens" />
  <n-modal v-model:show="showMatchModal" style="margin: 5%">
    <n-card>
      <n-space style="margin-bottom: 10px" justify="end">
        <n-button v-if="filterIsNull" @click="() => switchFilter(false)">
          전체보기
        </n-button>
        <n-button v-else @click="() => switchFilter(true)">
          매칭실패만보기
        </n-button>
      </n-space>
      <n-data-table
        :data="filteredMatchData"
        :columns="matchCols"
        :single-line="false"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="800"
      />
      <template #action>
        <n-space justify="end">
          <n-button @click="onSaveMatch"> 주문데이터로 넘기기 </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
  <n-modal v-model:show="openSelectList" style="margin: 5%">
    <n-card title="상품선택">
      <template #header-extra>
        <n-input v-model:value="searchInputVal" placeholder="상품검색" />
        <n-button @click="search"> 검색 </n-button>
      </template>
      <n-data-table
        ref="tableRef"
        :columns="tableCols"
        :data="searchedData"
        :pagination="{
          showSizePicker: true,
          pageSizes: [5, 10, 25, 50, 100],
        }"
        :bordered="false"
        :table-layout="'fixed'"
        :scroll-x="1200"
      />
    </n-card>
  </n-modal>
</template>
