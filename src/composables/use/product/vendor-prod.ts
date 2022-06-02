import type { VendorProd } from "@/composables";
import { useVendorsStore } from "@/stores";
import { getVendorProd } from "@/plugins/firebase";
import { onBeforeMount, ref } from "vue";

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

export function useVendor(vendorId: string) {
  const prods = ref<VendorProd[]>([]);
  onBeforeMount(async () => {
    prods.value = await getVendorProd(vendorId);
  });
  return { prods };
}
