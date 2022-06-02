import { ioColors } from "./composables/config";
import { AxiosInstance } from "axios";
import { ioFire } from "@/plugins/firebase";
import type { Router } from "vue-router";
import "pinia";

declare module "vue" {
  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $http: AxiosInstance;
    $fire: typeof ioFire;
    ioColors: ioColors;
  }
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    // // by using a setter we can allow both strings and refs
    // set hello(value: string | Ref<string>);
    // get hello(): string;
    $http: AxiosInstance;
    $fire: typeof ioFire;
    $router: Router;
  }
}
