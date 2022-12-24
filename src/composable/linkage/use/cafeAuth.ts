import _axios from "@/plugin/axios";
import { useAuthStore } from "@/store";
import { useMessage } from "naive-ui";
import { getCurrentInstance, onBeforeMount, computed, ref } from "vue";

export function useCafeAuth() {
  const mallId = ref<string | null>(null); // used Authorized
  const msg = useMessage();
  const auth = useAuthStore();
  const CAFE_CLIENT_ID = "mnhAX4sDM9UmCchzOwzTAA";
  const inst = getCurrentInstance();
  const http = inst?.appContext.config.globalProperties.$http ?? _axios;

  const path = "/shop/orderlinkage";
  const baseUri =
    import.meta.env.MODE === "production"
      ? "https://inout-box.com"
      : "https://io-box--dev-pcug7p0p.web.app";
  const redirectUri = baseUri + path;

  onBeforeMount(async () => {
    const urlParameter = window.location.search;
    const params = new URLSearchParams(urlParameter);
    const code = params.get("code");
    const state = params.get("state");

    if (code && code.length > 3 && state && state.length > 2) {
      const stateObj = JSON.parse(state);
      console.log(urlParameter, "stateObj ", stateObj, "code", code);
      const formData = new FormData();
      formData.set("code", code);
      formData.set("redirectUri", redirectUri);
      formData.set("mallId", stateObj.mallId);
      formData.set("userId", stateObj.userId);
      const saveCafeTokenRes = await http.post(
        `/linkage/saveCafeToken`,
        formData
      );
      console.log("saveCafeTokenRes: ", saveCafeTokenRes);
    }
  });
  function authorizeCafe() {
    if (!mallId.value) {
      return msg.error("쇼핑몰 ID를 입력 해주세요.");
    }
    console.log("authUrl: ", authUrl.value);
    window.location.href = authUrl.value;
  }
  const stateStr = computed(() =>
    JSON.stringify({
      mallId: mallId.value,
      userId: auth.currUser.userInfo.userId,
    })
  );

  const authUrl = computed(
    () =>
      `https://${mallId.value}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${CAFE_CLIENT_ID}&state=${stateStr.value}&redirect_uri=${redirectUri}&scope=mall.read_product mall.read_order`
  );
  return {
    authorizeCafe,
    mallId,
  };
}
