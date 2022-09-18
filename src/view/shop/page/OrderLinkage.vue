<script setup lang="ts">
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { computed, ref, getCurrentInstance, onBeforeMount } from "vue";

const auth = useAuthStore();
const CAFE_CLIENT_ID = "mnhAX4sDM9UmCchzOwzTAA";
const msg = useMessage();
const model = ref({
  zz: null,
  mallId: null,
});
const inst = getCurrentInstance();
const http = inst?.appContext.config.globalProperties.$http;
const authUrl = computed(
  () =>
    `https://${model.value.mallId}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CAFE_CLIENT_ID}&state=${model.value.mallId}&redirect_uri=https://inout-box.com/orderlinkage&scope=mall.read_product,mall.read_order,mall.write_application,mall.read_application`
);
onBeforeMount(async () => {
  const urlParameter = window.location.search;
  const params = new URLSearchParams(urlParameter);
  const code = params.get("code");
  const mallId = params.get("state");
  console.log(urlParameter, "mallId: ", mallId, "code", code);
  if (code && code.length > 3 && mallId && mallId.length > 2) {
    const formData = new FormData();
    formData.set("code", code);
    formData.set("redirectUri", "https://inout-box.com/orderlinkage");
    formData.set("mallId", mallId);
    formData.set("userId", auth.currUser.userInfo.userId);
    const saveCafeTokenRes = await http.post(
      `/linkage/saveCafeToken`,
      formData
    );
    console.log("saveCafeTokenRes: ", saveCafeTokenRes);
  }
});

function authorizeCafe() {
  if (!model.value.mallId) {
    return msg.error("쇼핑몰 ID를 입력 해주세요.");
  }
  console.log("authUrl: ", authUrl.value);
  // window.location.href = authUrl.value;
}
</script>

<template>
  <n-card title="주문연동">
    <n-space vertical>
      <n-space>
        <n-h5 style="text-align: start"
          >주문내역 일자 범위선택 (3개월이내)</n-h5
        >
        <n-input v-model:value="model.zz" />
      </n-space>
      <n-space>
        <n-h5 style="text-align: start">쇼핑몰 ID 입력</n-h5>
        <n-input v-model:value="model.mallId" />
      </n-space>
    </n-space>
    <n-space justify="end">
      <n-button @click="authorizeCafe"> 카페24 연동 </n-button>
    </n-space>
  </n-card>
</template>
