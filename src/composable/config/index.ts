export * from "./themes/light";
export * from "./themes/dark";
import { enUS, dateEnUS, koKR, dateKoKR, zhCN, dateZhCN } from "naive-ui";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { darkThemeOver } from "./themes/dark";
import { lightThemeOver } from "./themes/light";
import { useAuthStore, useCommonStore } from "@/store";

export function useNaiveConfig() {
  const cs = useCommonStore();
  const { locale } = storeToRefs(cs);

  const auth = useAuthStore();
  const isDark = computed(() => (auth.user ? auth.user.preferDark : false));
  const currTheme = computed(() =>
    isDark.value ? darkThemeOver : lightThemeOver
  );
  const naiveLocate = computed(() => {
    switch (locale.value) {
      case "ko":
        return {
          naiveLocale: koKR,
          naiveDate: dateKoKR,
        };
      case "en":
        return {
          naiveLocale: enUS,
          naiveDate: dateEnUS,
        };
      case "cn":
        return {
          naiveLocale: zhCN,
          naiveDate: dateZhCN,
        };
      default:
        throw new Error(`not supported naive locale ${locale.value}`);
    }
  });
  return {
    isDark,
    currTheme,
    auth,
    naiveLocate,
  };
}
