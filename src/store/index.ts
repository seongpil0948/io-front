export * from "./auth";
export * from "./vendor-prod";
export * from "./common";
export * from "./shop";

import { createPinia } from "pinia";
import _axios from "@/plugin/axios";
import router from "@/plugin/router";
import { ioFire } from "@/plugin/firebase";
import debounce from "lodash.debounce";
import { markRaw } from "vue";
const pinia = createPinia();

pinia.use(({ options, store }) => {
  store.$router = markRaw(router);
  store.$fire = ioFire;
  store.$http = _axios;

  if (options.debounce) {
    // we are overriding the actions with new ones
    return Object.keys(options.debounce).reduce((debouncedActions, action) => {
      if (options.debounce && options.debounce[action]) {
        debouncedActions[action] = debounce(
          store[action],
          options.debounce[action]
        );
      }
      return debouncedActions;
    }, {} as { [k: string]: any });
  }
});

export { pinia };
