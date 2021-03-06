import { createApp, markRaw } from "vue";
import router from "./plugins/router";
import _axios from "./plugins/axios";
import { ioFire } from "./plugins/firebase";
import moment from "moment";
import { createPinia } from "pinia";
import App from "./App.vue";
import { ioColors } from "./composables";
import vueKakao from "./plugins/kakao";
import { getMessaging, onMessage } from "@firebase/messaging";
import { logger } from "./plugins/logger";

window.onerror = function (errorMsg, url, errorObj) {
  logger.error(
    null,
    "Error: " + errorMsg + " Script: " + url + " StackTrace: ",
    errorObj
  );
};
Date.prototype.toJSON = function () {
  return moment(this).format();
};

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(vueKakao, {
  apiKey: "96b525bca68b5ec991f5e96c39db8111",
  callback: () => {
    logger.debug(null, "KAKAKO SDK is installed");
  },
});
app.use(router);
app.use(logger);
pinia.use(({ store }) => {
  store.$router = markRaw(router);
  store.$fire = ioFire;
  store.$http = _axios;
});
app.config.globalProperties.$http = _axios;
app.config.globalProperties.$fire = ioFire;
app.config.globalProperties.ioColors = ioColors;
app.mount("#app");

const messaging = getMessaging();
onMessage(messaging, (payload) => {
  logger.info(null, "Foreground Message received. in onMessage ", payload);
});

const channel = new BroadcastChannel("sw-messages");
channel.addEventListener("message", function (event) {
  logger.info(
    null,
    "Receive message in foreground-side from  sw-messages channel event: ",
    event
  );
});
