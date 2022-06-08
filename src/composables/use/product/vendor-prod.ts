import { useVendorsStore } from "@/stores";
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
