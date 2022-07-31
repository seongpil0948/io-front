import { createApp } from "vue";
import router from "./plugin/router";
import _axios from "./plugin/axios";
import { ioFire } from "./plugin/firebase";
import moment from "moment";

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
logger.info(null, "in-out box front(web) has Ignited, with Env: ", process.env);
Date.prototype.toJSON = function () {
  return moment(this).format();
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
app.config.globalProperties.$fire = ioFire;
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
