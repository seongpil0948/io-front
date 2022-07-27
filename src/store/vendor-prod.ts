import { defineStore } from "pinia";
import cloneDeep from "lodash.clonedeep";
import {
  IoUser,
  StockCntObj,
  USER_DB,
  USER_ROLE,
  VendorGarment,
  VendorUserGarment,
  VendorUserGarmentCombined,
  VENDOR_GARMENT_DB,
} from "@/composable";

interface VendorStoreInterface {
  vendors: IoUser[];
  vendorProds: VendorGarment[];
}

export const useVendorsStore = defineStore({
  id: "vendorProd",
  state: () =>
    <VendorStoreInterface>{
      vendors: [],
      vendorProds: [],
    },
  getters: {
    isInitial: (state) =>
      state.vendors.length === 0 && state.vendorProds.length === 0,
    vendorsById: (state) =>
      state.vendors.reduce<{ [userId: string]: IoUser }>((acc, user) => {
        acc[user.userInfo.userId] = user;
        return acc;
      }, {}),
    // vendorProdsById: (state) =>
    //   state.vendorProds.reduce<{ [prodId: string]: VendorProd }>((acc, p) => {
    //     acc[p.vendorProdId] = p;
    //     return acc;
    //   }, {}),
    vendorUserProds(): VendorUserGarment[] {
      return this.vendorProds.map((p) =>
        Object.assign(p, this.vendorsById[p.vendorId])
      );
    },
    vendorUserCombinedProds(): {
      [userAndProdName: string]: VendorUserGarmentCombined;
    } {
      return this.vendorUserProds.reduce<{
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
    },
  },
  actions: {
    async getVendorProducts() {
      this.vendorProds = await VENDOR_GARMENT_DB.getVendorGarment(null);
    },
    async getVendors() {
      this.vendors = await USER_DB.getUsersByRole(USER_ROLE.VENDOR);
    },
  },
});

// csp#4466
