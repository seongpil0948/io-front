<script setup lang="ts">
import axios from "@/plugins/axios";
import { useAuthStore } from "@/stores";
import { onBeforeMount, ref } from "vue";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useMessage } from "naive-ui";
import { AxiosError } from "axios";
import { ko } from "date-fns/locale";

const authStore = useAuthStore();
const user = authStore.currUser;
const redirectUri =
  window.location.protocol === "http:"
    ? "https://io-box.web.app/orderlinkage"
    : window.location.protocol + "//" + window.location.host + "/orderlinkage";
const mallId = ref("jiwooon0316"); // FIXME
const msg = useMessage();
let date = ref([
  new Date(new Date().setMonth(new Date().getMonth() - 2)),
  new Date(),
]);
function labelFormat(d: Date[]) {
  const dToString = (dd: Date) => {
    const a = dd.toLocaleDateString().split("/");
    return `${a[2]}년 ${a[0]}월 ${a[1]}일`;
  };
  return `${dToString(d[0])} -> ${dToString(d[1])}`;
}

onBeforeMount(async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code");
  const isCafe = code !== null && urlParams.get("state") === "cafe-box";
  if (isCafe) {
    const form = new FormData();
    form.set("code", code);
    form.set("redirectUri", redirectUri);
    form.set("mallId", mallId.value);
    form.set("userId", user.userInfo.userId);
    axios.post("/linkage/saveCafeToken", form);
  }
});

function linkCafe() {
  const url = `https://${mallId.value}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=mnhAX4sDM9UmCchzOwzTAA&state=cafe-box
&redirect_uri=${redirectUri}&scope=mall.read_product mall.read_order`;
  console.log("cafe code url: ", url);
  window.location.href = url;
}
async function getCafeOrders() {
  if (date.value[1].getMonth() - date.value[0].getMonth() > 3) {
    msg.error("3개월 이내의 주문내역만 받아 올 수 있습니다.");
  }
  const getDay = (a: Date) =>
    new Date(a.setHours(a.getHours() + 9)).toISOString().split("T")[0];
  const startDate = getDay(date.value[0]);
  const endDate = getDay(date.value[1]);
  // const startDate = date.value[0].toISOString().split("T")[0];
  // const endDate = date.value[1].toISOString().split("T")[0];
  console.log("startDate: ", startDate);
  console.log("endDate: ", endDate);

  if (date.value) {
    const form = new FormData();
    form.set("mallId", mallId.value);
    form.set("userId", user.userInfo.userId);
    form.set("startDate", startDate);
    form.set("endDate", endDate);
    axios
      .post("/linkage/getCafeOrders", form)
      .then((res) => {
        console.log("ORDER LIST: ", res.data);
      })
      .catch((err: AxiosError) => {
        console.log("ERROR: ", err);
        if (err.response) {
          const data: any = err.response?.data;
          console.log("err.response");
          if (
            err.response.status === 401 ||
            err.response.statusText === "Unauthorized" ||
            (data.error && data.error.code && data.error.code === 401)
          ) {
            console.log("linkCafe");
            linkCafe();
          }
        }
      });
  }
}
</script>

<template>
  <n-card title="주문연동">
    <n-space vertical>
      <n-h5 style="text-align: start">주문내역 일자 범위선택 (3개월이내)</n-h5>
      <Datepicker
        locale="ko"
        :format-locale="ko"
        :format="labelFormat"
        v-model="date"
        range
        utc
        maxRange="90"
        selectText="선택"
        cancelText="취소"
        placeholder="주문내역 일자 범위선택 (3개월이내)"
        :enableTimePicker="false"
      />
      <n-space justify="space-around">
        <n-h5>카페24 Mall ID</n-h5>
        <n-input v-model:value="mallId" />
      </n-space>
      <n-button @click="getCafeOrders"> 카페24연동 </n-button>
    </n-space>
  </n-card>
</template>
