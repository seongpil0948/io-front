import { LOCALE } from "@/composable";
import { ScreenSize } from "@/util";
import { defineStore } from "pinia";
import { VNodeChild, ref, computed, onBeforeMount, onBeforeUnmount } from "vue";

declare type ContentType = string | (() => VNodeChild);

export const useCommonStore = defineStore("common", () => {
  const msgQueue = ref<{ isError: boolean; content: ContentType }[]>([]);
  const loading = ref(false);
  const showSpin = ref(false);
  const locale = ref<LOCALE>("ko");
  const isLoading = computed(() => loading.value === true);

  const bodySize = ref({ w: window.innerWidth, h: window.innerHeight });
  let resizeTimeout: NodeJS.Timeout | null = null;
  function resizeHandler() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      bodySize.value.h = window.innerHeight;
      bodySize.value.w = window.innerWidth;
    }, 500);
  }
  onBeforeMount(() => window.addEventListener("resize", resizeHandler));
  onBeforeUnmount(() => window.removeEventListener("resize", resizeHandler));
  const screenWidth = computed<ScreenSize>(() => {
    const w = bodySize.value.w;
    if (w < 400) return "S";
    if (w < 700) return "M";
    else return "L";
  });

  return {
    msgQueue,
    loading,
    showSpin,
    locale,
    isLoading,
    screenWidth,
  };
});
