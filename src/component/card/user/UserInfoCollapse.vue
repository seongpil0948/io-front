<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import clone from "lodash.clonedeep";

import { useAuthStore } from "@/store";
import { deadOpt, shipMethodOpt } from "@/util";
import {
  IoUser,
  VendorOperInfo,
  SALE_MANAGE,
  ShopOperInfo,
  USER_DB,
} from "@io-boxies/js-lib";
import { useMessage } from "naive-ui";
import { ioFireStore } from "@/plugin/firebase";

const authStore = useAuthStore();
const msg = useMessage();
const authModel = ref<IoUser | null>(null);
onBeforeMount(() => {
  authModel.value = clone(authStore.currUser);
});
// watch(
//   () => authModel.value,
//   async (val, oldVal) => {
//     if (!oldVal) return;
//     else if (val) {
//       await val.update();
//     }
//   },
//   { immediate: false, deep: true }
// );
async function updateUser() {
  if (authModel.value) {
    await USER_DB.updateUser(ioFireStore, authModel.value);
    authStore.setUser(authModel.value);
    msg.info("변경 완료.");
  }
}
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
          <n-text strong> 업체명 </n-text>
          <n-text>{{ authModel.companyInfo!.companyName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 사업자 등록번호 </n-text>
          <n-text>{{ authModel.companyInfo!.companyNo }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 대표자명 </n-text>
          <n-text>{{ authModel.companyInfo!.ceoName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 대표 연락처 </n-text>
          <n-text>{{ authModel.companyInfo!.ceoPhone }}</n-text>
        </div>
        <n-space justify="space-between">
          <n-text strong> 주소지 </n-text>
          <user-locate-list
            v-if="authModel.companyInfo"
            v-model:info="authModel.companyInfo"
            style="padding: 2%"
            @update:info="updateUser"
          />
        </n-space>
        <n-a
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.google.com/forms/d/e/1FAIpQLSfiqRLuVKfhiIvk6JwuAp-daQ7OQ2_vcQOToxgy7vGDz-4NtQ/viewform"
        >
          정보 변경 요청하기
        </n-a>
      </n-space>
    </n-collapse-item>
    <n-collapse-item title="계정정보" name="2">
      <n-space vertical style="width: 100%">
        <div class="io-row">
          <n-text strong> 역할 </n-text>
          <n-text>{{ authModel.userInfo.role }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 이메일 </n-text>
          <n-text>{{ authModel.userInfo.email }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 쇼핑몰 명 </n-text>
          <n-text>{{ authModel.userInfo.userName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 닉네임 </n-text>
          <n-text>{{ authModel.userInfo.displayName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 운영링크 </n-text>
          <n-text>{{ authModel.companyInfo?.shopLink }}</n-text>
        </div>
      </n-space>
    </n-collapse-item>
    <n-collapse-item title="운영정보" name="3">
      <n-space
        v-if="authModel.userInfo.role === 'SHOP'"
        vertical
        style="width: 100%"
      >
        <div class="io-row">
          <n-text strong> 현재사입방식 </n-text>
          <n-select
            v-model:value="(authModel.operInfo as ShopOperInfo).purchaseMethod"
            :options="shipMethodOpt"
            @update:value="updateUser"
          />
        </div>
      </n-space>
      <n-space
        v-if="authModel.userInfo.role === 'VENDOR'"
        vertical
        style="width: 100%"
      >
        <div class="io-row">
          <n-text strong> 주문 자동 승인 </n-text>
          <yes-or-no-radio
            v-model:value="(authModel.operInfo as VendorOperInfo).autoOrderApprove"
            :yes-val="true"
            :no-val="false"
            @update:value="updateUser"
          />
        </div>
        <div class="io-row">
          <n-text strong> 장기 종류 </n-text>
          <yes-or-no-radio
            v-model:value="(authModel.operInfo as VendorOperInfo).saleManageType"
            :yes-val="SALE_MANAGE.HAND_WRITE"
            yes-label="수기"
            :no-val="SALE_MANAGE.ONLINE"
            no-label="포스&온라인"
            @update:value="updateUser"
          />
        </div>
        <div class="io-row">
          <n-text strong> 월 세금계산서 마감일 </n-text>
          <n-select
            v-model:value="(authModel.operInfo as VendorOperInfo).taxDeadlineDay"
            :options="deadOpt"
            @update:value="updateUser"
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
