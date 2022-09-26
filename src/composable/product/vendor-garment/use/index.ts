import { useVendorsStore } from "@/store";
import { ref, computed } from "vue";
export function useSearchVendorGarment() {
  const vendorStore = useVendorsStore();

  const prodSearchVal = ref(null);
  const filteredGarments = computed(() =>
    Object.values(vendorStore.vendorUserCombinedGarments).filter((x) => {
      const v = prodSearchVal.value;
      return v === null
        ? true
        : x.fabric.includes(v) ||
            x.description.includes(v) ||
            x.vendorProdName.includes(v);
    })
  );
  return {
    prodSearchVal,
    filteredGarments,
  };
}
