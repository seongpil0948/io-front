import { defineStore } from "pinia";
import { VNodeChild } from "vue";

declare type ContentType = string | (() => VNodeChild);
interface CommonStoreInterface {
  msgQueue: { isError: boolean; content: ContentType }[];
  loading: boolean;
  showSpin: boolean;
}
export const useCommonStore = defineStore({
  id: "common",
  state: () =>
    <CommonStoreInterface>{
      msgQueue: [],
      loading: false,
      showSpin: false,
    },
  getters: {
    isLoading: (state) => state.loading === true,
  },
});
