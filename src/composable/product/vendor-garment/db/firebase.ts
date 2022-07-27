/* eslint-disable @typescript-eslint/no-unused-vars */
import { VendorGarment, VendorGarmentDB } from "@/composable";

export const VendorGarmentFB: VendorGarmentDB = {
  getVendorGarment: function (
    vendorId: string | null
  ): Promise<VendorGarment[]> {
    throw new Error("Function not implemented.");
  },
  create: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  update: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  delete: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  read: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
};
