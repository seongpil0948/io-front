import { AxiosInstance } from "axios";
import { ioFire } from "@/plugin/firebase";
import type { Router } from "vue-router";
import "pinia";
import "vue-router";
import "vue";
import type { Kakao } from "@types/kakao-js-sdk";

declare global {
  interface Window {
    Kakao?: Kakao;
  }
}

declare module "vue" {
  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $http: AxiosInstance;
    $fire: typeof ioFire;
    $kakao: Kakao;
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
    $kakao: Kakao;
  }
}

declare module "vue-router" {
  export declare interface RouteMeta {
    allowRoles?: USER_ROLE[];
  }
  interface Router {
    goHome(user?: IoUser): void;
  }
}
