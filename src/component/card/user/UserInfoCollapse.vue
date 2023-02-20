<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import clone from "lodash.clonedeep";
import {
  defaultCompanyInfo,
  defaultShopOper,
  defaultVendorOper,
  IoUser,
  VendorOperInfo,
  SALE_MANAGE,
  ShopOperInfo,
  USER_DB,
  IoAccount,
} from "@/composable";
import { useAuthStore } from "@/store";
import { deadOpt, shipMethodOpt } from "@/util";
import { getParentRef, IoFireApp, uploadFile } from "@io-boxies/js-lib";
import { useMessage } from "naive-ui";
import { ioFireStore } from "@/plugin/firebase";
import { DEFAULT_PROFILE_IMG } from "@/constants";
import { getStorage, ref as storageRef } from "@firebase/storage";
import { updateProfile, getAuth } from "firebase/auth";
const authStore = useAuthStore();
const msg = useMessage();
const authModel = ref<IoUser | null>(null);
onBeforeMount(async () => {
  authModel.value = clone(authStore.currUser());
  const a = authModel.value;
  if (a) {
    let update = false;
    if (!a.companyInfo) {
      authModel.value.companyInfo = defaultCompanyInfo();
      update = true;
    }
    if (a.userInfo.role === "SHOP" && !a.operInfo) {
      authModel.value.operInfo = defaultShopOper();
      update = true;
    } else if (a.userInfo.role === "VENDOR" && !a.operInfo) {
      authModel.value.operInfo = defaultVendorOper();
      update = true;
    }
    if (update) await updateUser(false);
  }
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
async function updateUser(useMsg = true) {
  if (authModel.value) {
    console.log("authModel: ", authModel.value);
    await USER_DB.updateUser(ioFireStore, authModel.value);
    authStore.setUser(authModel.value);
    if (useMsg) msg.info("변경 완료.");
  }
}
const loadingProfile = ref(false);
const inputProfile = ref<HTMLInputElement | null>(null);
const profileSrc = computed(() =>
  authModel.value &&
  authModel.value.userInfo.profileImg &&
  authModel.value.userInfo.profileImg.length > 1
    ? authModel.value.userInfo.profileImg
    : DEFAULT_PROFILE_IMG
);
async function onClickProfile() {
  if (
    !authModel.value ||
    !inputProfile.value ||
    !inputProfile.value!.files ||
    inputProfile.value.files.length < 1
  )
    return;
  loadingProfile.value = false;
  const parent = getParentRef({
    storage: getStorage(IoFireApp.getInst().app),
    svc: "USER",
    userId: authStore.uid,
  });

  const imgs = await uploadFile(
    storageRef(parent.storage, `${parent.fullPath}/profileImgs`),
    inputProfile.value.files
  );
  authModel.value.userInfo.profileImg = imgs[0];
  await USER_DB.updateUser(ioFireStore, authModel.value);
  authStore.setUser(authModel.value);
  loadingProfile.value = false;
  const u = getAuth().currentUser;
  if (u) await updateProfile(u, { photoURL: imgs[0] });
  msg.info("변경 완료.");
}
async function onSubmitAccount(acc: IoAccount) {
  if (!authModel.value) return msg.error("다시 시도해주세요");
  authModel.value.userInfo.account = acc;
  console.log("new account : ", acc);
  return updateUser();
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
      <n-space v-if="authModel.companyInfo" vertical style="width: 100%">
        <div class="io-row">
          <n-text strong> 상호명 </n-text>
          <n-text>{{ authModel.companyInfo.companyName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 사업자 등록번호 </n-text>
          <n-text>{{ authModel.companyInfo.companyNo }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 대표자명 </n-text>
          <n-text>{{ authModel.companyInfo.ceoName }}</n-text>
        </div>
        <div class="io-row">
          <n-text strong> 대표 연락처 </n-text>
          <n-text>{{ authModel.companyInfo.ceoPhone }}</n-text>
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
        <div class="io-row">
          <n-text strong> 프로필 이미지 </n-text>
          <n-popover trigger="hover">
            <template #trigger>
              <n-spin :show="loadingProfile">
                <label for="inputProfile">
                  <n-avatar
                    round
                    size="small"
                    style="cursor: pointer"
                    :fallback-src="DEFAULT_PROFILE_IMG"
                    :src="profileSrc"
                  />
                </label>
              </n-spin>
            </template>
            <n-image
              :src="profileSrc"
              preview-disabled
              width="150"
              height="150"
            />
          </n-popover>
        </div>
        <input
          id="inputProfile"
          ref="inputProfile"
          name="inputProfile"
          type="file"
          style="visibility: hidden"
          accept="image/*"
          @change="onClickProfile"
        />
      </n-space>
    </n-collapse-item>
    <n-collapse-item title="운영정보" name="3">
      <n-space
        v-if="authModel.userInfo.role === 'SHOP' && authModel.operInfo"
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
        v-if="authModel.userInfo.role === 'VENDOR' && authModel.operInfo"
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
    <n-collapse-item
      v-if="authModel && authModel.userInfo"
      title="계좌정보"
      name="4"
    >
      <bank-account-form
        :acc="authModel.userInfo.account"
        @submit:account="onSubmitAccount"
      />
    </n-collapse-item>
  </n-collapse>
</template>
