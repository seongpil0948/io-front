import { App } from "vue";

export default {
  install(app: App, options: any) {
    console.log("Install Payment Gateway", app, options);
  },
};
