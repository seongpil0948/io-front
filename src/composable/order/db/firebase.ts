import { OrderDB } from "../domain";

export const OrderFB: OrderDB = {
  orderGarment: function (row: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  create: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  update: function (dbId: string): Promise<void> {
    throw new Error("Function not implemented.");
  },
  delete: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  read: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchCreate: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchUpdate: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchDelete: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchRead: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
};
