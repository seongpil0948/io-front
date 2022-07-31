import { defineStore } from "pinia";
import cloneDeep from "lodash.clonedeep";
import {
  IoUser,
  StockCntObj,
  USER_DB,
  USER_ROLE,
  VendorUserGarment,
  VendorUserGarmentCombined,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { computed, ref, onBeforeMount } from "vue";

export const useVendorsStore = defineStore(
  "vendorProd",
  () => {
    const vendors = ref<IoUser[]>([]);
    const obj = VENDOR_GARMENT_DB.batchReadListen([]);
    const vendorGarments = obj.items;

    const isInitial = computed<boolean>(
      () => vendors.value.length === 0 && vendorGarments.value.length === 0
    );

    const vendorsById = computed<{ [userId: string]: IoUser }>(() =>
      vendors.value.reduce((acc: any, user: any) => {
        acc[user.userInfo.userId] = user;
        return acc;
      }, {} as { [userId: string]: IoUser })
    );

    const vendorUserGarments = computed<VendorUserGarment[]>(() => {
      return vendorGarments.value
        .map((p) => {
          return vendorsById.value[p.vendorId]
            ? Object.assign(p, vendorsById.value[p.vendorId])
            : null;
        })
        .filter((x) => x) as VendorUserGarment[];
    });

    const vendorUserCombinedGarments = computed(() => {
      return vendorUserGarments.value.reduce<{
        [userAndProdName: string]: VendorUserGarmentCombined;
      }>((acc, curr) => {
        const combineId = curr.combineId;
        if (!acc[combineId]) {
          acc[combineId] = Object.assign(cloneDeep(curr), {
            allStockCnt: 0,
            colors: [],
            sizes: [],
            stockCnt: {} as StockCntObj,
          });
        }
        if (!acc[combineId].stockCnt[curr.size]) {
          acc[combineId].stockCnt[curr.size] = {};
        }
        acc[combineId].stockCnt[curr.size][curr.color] = {
          stockCnt: curr.stockCnt,
          prodId: curr.vendorProdId,
        };
        if (!acc[combineId].sizes.includes(curr.size)) {
          acc[combineId].sizes.push(curr.size);
        }
        if (!acc[combineId].colors.includes(curr.color)) {
          acc[combineId].colors.push(curr.color);
        }
        acc[combineId].allStockCnt += curr.stockCnt;
        return acc;
      }, {});
    });

    async function getVendors() {
      vendors.value = await USER_DB.getUsersByRole(USER_ROLE.VENDOR);
    }
    onBeforeMount(async () => {
      if (isInitial.value) {
        await getVendors();
      }
    });

    return {
      vendors,
      vendorsById,
      vendorGarments,
      vendorUserGarments,
      isInitial,
      vendorUserCombinedGarments,
      getVendors,
    };
  },
  {
    debounce: {
      getVendors: 5000,
    },
  }
);
