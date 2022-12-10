import { createApp } from "vue";

import router from "./plugin/router";
import _axios from "./plugin/axios";
import App from "./App.vue";
import vueKakao from "./plugin/kakao";
import { getMessaging, onMessage } from "@firebase/messaging";
import { logger } from "./plugin/logger";
import { ioFire } from "./plugin/firebase";
import { pinia } from "./store";
// import { ioFire } from "@io-boxies/js-lib";
// import { connectFirestoreEmulator } from "@firebase/firestore";
// import { connectStorageEmulator } from "@firebase/storage";
// import { connectAuthEmulator, getAuth } from "@firebase/auth";

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

const messaging = getMessaging(ioFire.app);
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
// connectFirestoreEmulator(ioFire.store, "127.0.0.1", 8080);
// connectStorageEmulator(ioFire.storage, "127.0.0.1", 9199);
// connectAuthEmulator(getAuth(), "127.0.0.1:9099");
