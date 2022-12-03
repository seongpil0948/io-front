import { defineStore } from "pinia";
import { VendorUserGarment, VENDOR_GARMENT_DB } from "@/composable";
import { computed, ref, onBeforeMount } from "vue";
import { IoUser, USER_DB } from "@io-boxies/js-lib";

export const useVendorsStore = defineStore(
  "vendorProd",
  () => {
    console.log(`=== called useVendorsStore === `);
    const vendors = ref<IoUser[]>([]);
    const obj = VENDOR_GARMENT_DB.batchReadListen([]);
    const vendorProds = obj.items;

    const isInitial = computed<boolean>(
      () => vendors.value.length === 0 && vendorProds.value.length === 0
    );

    const vendorById = computed<{ [userId: string]: IoUser }>(() =>
      vendors.value.reduce((acc: any, user: any) => {
        acc[user.userInfo.userId] = user;
        return acc;
      }, {} as { [userId: string]: IoUser })
    );

    const vendorUserGarments = computed<VendorUserGarment[]>(() => {
      return vendorProds.value
        .map((p) => {
          return vendorById.value[p.vendorId]
            ? Object.assign({}, vendorById.value[p.vendorId], p)
            : null;
        })
        .filter((x) => x) as VendorUserGarment[];
    });

    async function getVendors() {
      vendors.value = await USER_DB.getUsersByRole("VENDOR");
    }
    onBeforeMount(async () => {
      if (isInitial.value) {
        await getVendors();
      }
    });

    return {
      vendors,
      vendorById,
      vendorProds,
      vendorUserGarments,
      isInitial,
      getVendors,
    };
  },
  {
    debounce: {
      getVendors: 5000,
    },
  }
);
