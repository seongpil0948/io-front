import { analytics } from "@/plugin/firebase";
import { logEvent } from "@firebase/analytics";
import { ref, Ref, computed } from "vue";

interface IoSearchParam<T> {
  data: Ref<T[]>;
  filterFunc: (data: T, searchVal: string | null) => boolean;
}

export function useSearch<T>(p: IoSearchParam<T>) {
  const searchInputVal = ref<string | null>(null);
  const searchVal = ref<string | null>(null);

  const searchedData = computed(() =>
    p.data.value.filter((e) => p.filterFunc(e, searchVal.value))
  );
  function search() {
    searchVal.value = searchInputVal.value;
    if (searchVal.value && searchVal.value.length > 1) {
      logEvent(analytics, "search", { search_term: searchVal.value });
    }
  }

  return { searchedData, search, searchInputVal };
}
