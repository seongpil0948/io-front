import { createApp } from "vue";
import router from "./plugin/router";
import _axios from "./plugin/axios";

import App from "./App.vue";
import vueKakao from "./plugin/kakao";
import { getMessaging, onMessage } from "@firebase/messaging";
import { logger } from "./plugin/logger";
import { pinia } from "./store";

window.onerror = function (errorMsg, url, errorObj) {
  logger.error(
    null,
    "Error: " + errorMsg + " Script: " + url + " StackTrace: ",
    errorObj
  );
};
logger.debug(
  null,
  "in-out box front(web) has Ignited, with Env: ",
  import.meta.env
);
Date.prototype.toJSON = function () {
  return this.toISOString();
};

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

app.config.globalProperties.$http = _axios;
app.mount("#app");

const messaging = getMessaging();
onMessage(messaging, (payload) => {
  logger.debug(null, "Foreground Message received. in onMessage ", payload);
});

const channel = new BroadcastChannel("sw-messages");
channel.addEventListener("message", function (event) {
  logger.debug(
    null,
    "Receive message in foreground-side from  sw-messages channel event: ",
    event
  );
});
