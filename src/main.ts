import { createApp, markRaw } from "vue";
import router from "./plugins/router";
import _axios from "./plugins/axios";
import { ioFire } from "./plugins/firebase";
import moment from "moment";
import { createPinia } from "pinia";
import App from "./App.vue";
import { ioColors } from "./composables";

Date.prototype.toJSON = function () {
  return moment(this).format();
};

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
pinia.use(({ store }) => {
  store.$router = markRaw(router);
  store.$fire = ioFire;
  store.$http = _axios;
});
app.config.globalProperties.$http = _axios;
app.config.globalProperties.$fire = ioFire;
app.config.globalProperties.ioColors = ioColors;
app.mount("#app");
