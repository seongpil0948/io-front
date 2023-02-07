import { useAuthStore } from "@/store";
import { useAlarm } from "@io-boxies/vue-lib";
import { useDialog, useMessage } from "naive-ui";
import { computed } from "vue";
import { useLogger } from "vue-logger-plugin";
import { axiosConfig } from "@/plugin/axios";
import { makeMsgOpt, isMobile } from "@/util";
import { uuidv4 } from "@firebase/util";
import { useRouter } from "vue-router";

export function useCommon() {
  const msg = useMessage();
  const log = useLogger();
  const auth = useAuthStore();
  const u = auth.user ?? auth.currUser();
  const uid = computed(() => u.userInfo.userId);
  const smtp = useAlarm();
  const apiBaseUrl = axiosConfig.baseURL;
  const router = useRouter();
  const dialog = useDialog();

  return {
    msg,
    log,
    auth,
    u,
    uid,
    smtp,
    apiBaseUrl,
    makeMsgOpt,
    isMobile,
    uuidv4,
    router,
    dialog,
  };
}
