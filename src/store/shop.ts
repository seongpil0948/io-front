import { IoUser, USER_DB } from "@/composable";
import { defineStore } from "pinia";

interface VendorStoreInterface {
  shops: IoUser[];
}

export const useShopStore = defineStore({
  id: "shops",
  state: () =>
    <VendorStoreInterface>{
      shops: [],
    },
  getters: {
    isInitial: (state) => state.shops.length === 0,
  },
  actions: {
    async getShop(userId: string) {
      if (this.isInitial) {
        await this.setShops();
      }
      return this.shops.find((s) => s.userInfo.userId === userId);
    },
    async setShops() {
      this.shops = await USER_DB.getUsersByRole("SHOP");
    },
  },
});
