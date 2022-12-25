export * from "./auth";
export * from "./common";
export * from "./shopOrder";
export * from "./vendorOrder";
export * from "./uncleOrder";
export * from "./cs";

import { createPinia } from "pinia";
import _axios from "@/plugin/axios";
import router from "@/plugin/router";
import debounce from "lodash.debounce";
import { markRaw } from "vue";
import cloneDeep from "lodash.clonedeep";
const pinia = createPinia();

pinia.use(({ options, store }) => {
  store.$router = markRaw(router);
  store.$http = _axios;

  const initialState = cloneDeep(store.$state);
  store.$reset = () => store.$patch(cloneDeep(initialState));

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
