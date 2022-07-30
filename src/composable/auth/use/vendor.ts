import { useVendorsStore } from "@/store";
import { onBeforeMount } from "vue";

export function useVendors() {
  const vendorStore = useVendorsStore();
  onBeforeMount(async () => {
    if (vendorStore.isInitial) {
      await Promise.all([
        vendorStore.getVendorProducts(),
        vendorStore.getVendors(),
      ]);
    }
  });
  return { vendorStore };
}
