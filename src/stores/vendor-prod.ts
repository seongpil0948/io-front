import { defineStore } from "pinia";
import { getUsersByRole, getVendorProd } from "@/plugins/firebase";
import {
  USER_ROLE,
  type StockCntObj,
  type VendorUserProd,
  type VendorUserProdCombined,
} from "@/types";
import { VendorProd, type IoUser } from "../composables";
import cloneDeep from "lodash.clonedeep";

interface VendorStoreInterface {
  vendors: IoUser[];
  vendorProds: VendorProd[];
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
        acc[user.userId] = user;
        return acc;
      }, {}),
    // vendorProdsById: (state) =>
    //   state.vendorProds.reduce<{ [prodId: string]: VendorProd }>((acc, p) => {
    //     acc[p.vendorProdId] = p;
    //     return acc;
    //   }, {}),
    vendorUserProds(): VendorUserProd[] {
      return this.vendorProds.map((p) =>
        Object.assign(p, this.vendorsById[p.vendorId] ?? {})
      );
    },
    vendorUserCombinedProds(): {
      [userAndProdName: string]: VendorUserProdCombined;
    } {
      return this.vendorUserProds.reduce<{
        [userAndProdName: string]: VendorUserProdCombined;
      }>((acc, curr) => {
        const combineId = VendorProd.getCombineId(curr);
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
      this.vendorProds = await getVendorProd(null);
    },
    async getVendors() {
      this.vendors = await getUsersByRole(USER_ROLE.VENDOR);
    },
  },
});
