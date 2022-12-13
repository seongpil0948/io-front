import { ioFire } from "@/plugin/firebase";
import { logEvent, getAnalytics } from "@firebase/analytics";
import { ref, Ref, computed } from "vue";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useMessage } from "naive-ui";

export function useElasticSearch(d: {
  onSearch: (result: any) => void;
  makeInput: (val: string) => string;
  funcName: string;
}) {
  const searchInputVal = ref<string | null>(null);
  const searchVal = ref<string | null>(null);
  const searchData = ref<any[]>([]);
  const msg = useMessage();

  async function search() {
    searchVal.value = searchInputVal.value;
    const functions = getFunctions(ioFire.app, "asia-northeast3");
    const searchFunc = httpsCallable(functions, d.funcName);
    if (!searchVal.value || searchVal.value.length < 2) {
      searchData.value = [];
      return msg.warning("검색어를 두글자 이상 입력해주세요!");
    }
    return searchFunc({ input: d.makeInput(searchVal.value) })
      .then(d.onSearch)
      .catch((err) => console.error(`error in ${d.funcName}`, err));
  }
  return {
    searchInputVal,
    searchVal,
    searchData,
    search,
    msg,
  };
}

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
      logEvent(getAnalytics(ioFire.app), "search_vendor_prod", {
        search_term: searchVal.value,
      });
    }
  }

  return { searchedData, search, searchInputVal };
}
