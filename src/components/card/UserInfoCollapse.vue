<script setup lang="ts">
import {
  IoUser,
  locateStr,
  USER_ROLE,
  shipMethodOpt,
  deadOpt,
} from "@/composables";
import { useAuthStore } from "@/stores";
import { ShopOperInfo, VendorOperInfo, SALE_MANAGE } from "@/types";
import { onBeforeMount, ref, watch, watchEffect } from "vue";
import clone from "lodash.clonedeep";

const authStore = useAuthStore();
const authModel = ref<IoUser | null>(null);
onBeforeMount(() => {
  authModel.value = clone(authStore.currUser);
});
watch(
  authModel,
  async (val, oldVal) => {
    console.log(val, oldVal);
    if (!oldVal) return;
    else if (val) {
      console.log("changeUser in Watch");
      await val.update();
    }
  },
  { immediate: false, deep: true }
);
</script>

<template>
  <n-collapse
    v-if="authModel"
    display-directive="show"
    arrow-placement="right"
    accordion
  >
    <n-collapse-item title="사업자정보" name="1">
      <n-space vertical style="width: 100%">
        <div class="io-row">
          <n-text strong>업체명</n-text>
          <n-text>{{authModel.copanyInfo!.companyName}}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>사업자 등록번호</n-text>
          <n-text>{{authModel.copanyInfo!.companyNo}}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>대표자명</n-text>
          <n-text>{{authModel.copanyInfo!.ceoName}}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>대표 연락처</n-text>
          <n-text>{{authModel.copanyInfo!.ceoPhone}}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>주소지</n-text>
          <n-space justify="space-around">
            <n-tooltip
              trigger="hover"
              v-for="(i, idx) in authModel.copanyInfo!.locations"
              :key="idx"
            >
              <template #trigger>
                <n-tag> {{ i.alias }}</n-tag>
              </template>
              {{ locateStr(i) }}
            </n-tooltip>
          </n-space>
        </div>
        <n-a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfiqRLuVKfhiIvk6JwuAp-daQ7OQ2_vcQOToxgy7vGDz-4NtQ/viewform"
          >정보 변경 요청하기</n-a
        >
      </n-space>
    </n-collapse-item>
    <n-collapse-item title="계정정보" name="2">
      <n-space vertical style="width: 100%">
        <div class="io-row">
          <n-text strong>역할</n-text>
          <n-text>{{ authModel.userInfo.role }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>이메일</n-text>
          <n-text>{{ authModel.userInfo.email }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>매장이름</n-text>
          <n-text>{{ authModel.userInfo.userName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>닉네임</n-text>
          <n-text>{{ authModel.userInfo.displayName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong>운영링크</n-text>
          <n-text>{{ authModel.copanyInfo?.shopLink }}</n-text>
        </div>
      </n-space>
    </n-collapse-item>
    <n-collapse-item title="운영정보" name="3">
      <n-space
        vertical
        style="width: 100%"
        v-if="authModel.userInfo.role === USER_ROLE.SHOP"
      >
        <div class="io-row">
          <n-text strong>자동 미송잡기</n-text>
          <yes-or-no-radio
            v-model:value="authModel.operInfo!.autoPending"
            :yesVal="true"
            :noVal="false"
          />
        </div>
        <div class="io-row">
          <n-text strong>현재사입방식</n-text>
          <n-select
            v-model:value="(authModel.operInfo as ShopOperInfo).purchaseMethod "
            :options="shipMethodOpt"
          />
        </div>
      </n-space>
      <n-space
        vertical
        style="width: 100%"
        v-if="authModel.userInfo.role === USER_ROLE.VENDOR"
      >
        <div class="io-row">
          <n-text strong>자동 미송받기</n-text>
          <yes-or-no-radio
            v-model:value="authModel.operInfo!.autoPending"
            :yesVal="true"
            :noVal="false"
          />
        </div>
        <div class="io-row">
          <n-text strong>주문 자동 승인</n-text>
          <yes-or-no-radio
            v-model:value="(authModel.operInfo as VendorOperInfo).autoOrderApprove"
            :yesVal="true"
            :noVal="false"
          />
        </div>
        <div class="io-row">
          <n-text strong>장기 종류</n-text>
          <yes-or-no-radio
            v-model:value="(authModel.operInfo as VendorOperInfo).saleManageType"
            :yesVal="SALE_MANAGE.HAND_WRITE"
            yesLabel="수기"
            :noVal="SALE_MANAGE.ONLINE"
            noLabel="포스&온라인"
          />
        </div>
        <div class="io-row">
          <n-text strong>월 세금계산서 마감일</n-text>
          <n-select
            v-model:value="(authModel.operInfo as VendorOperInfo).taxDeadlineDay"
            :options="deadOpt"
          />
        </div>
      </n-space>
    </n-collapse-item>
  </n-collapse>
</template>

<style scoped lang="scss">
.io-row {
  display: inline-flex;
  justify-content: space-between;
  width: 100%;
  text-align: start;
  > :nth-child(1) {
    max-width: 30%;
  }
  :nth-child(2) {
    max-width: 50%;
  }
}
</style>
