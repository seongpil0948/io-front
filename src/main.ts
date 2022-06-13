import { createApp, markRaw } from "vue";
import router from "./plugins/router";
import _axios from "./plugins/axios";
import { ioFire } from "./plugins/firebase";
import moment from "moment";
import { createPinia } from "pinia";
import App from "./App.vue";
import { ioColors } from "./composables";
import vueKakao from "./plugins/kakao";
Date.prototype.toJSON = function () {
  return moment(this).format();
};

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(vueKakao, {
  apiKey: "96b525bca68b5ec991f5e96c39db8111",
  callback: () => {
    console.log("KAKAKO SDK is installed");
  },
});

pinia.use(({ store }) => {
  store.$router = markRaw(router);
  store.$fire = ioFire;
  store.$http = _axios;
});
app.config.globalProperties.$http = _axios;
app.config.globalProperties.$fire = ioFire;
app.config.globalProperties.ioColors = ioColors;
app.mount("#app");
