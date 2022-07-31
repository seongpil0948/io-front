/* eslint-disable @typescript-eslint/no-unused-vars */
import { ShopGarment } from "@/composable/product";
import { Ref } from "vue";
import { OrderCrt, OrderDB } from "../domain";

export const OrderFB: OrderDB<ShopGarment> = {
  orderGarment: function (row: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  create: function (
    arg: OrderCrt<ShopGarment>
  ): Promise<OrderCrt<ShopGarment>> {
    throw new Error("Function not implemented.");
  },
  update: function (dbId: string): Promise<void> {
    throw new Error("Function not implemented.");
  },
  delete: function (dbId: string): Promise<void> {
    throw new Error("Function not implemented.");
  },
  read: function (dbId: string): Promise<OrderCrt<ShopGarment>> {
    throw new Error("Function not implemented.");
  },
  batchCreate: function (
    args: OrderCrt<ShopGarment>[]
  ): Promise<OrderCrt<ShopGarment>[]> {
    throw new Error("Function not implemented.");
  },
  batchUpdate: function (args: OrderCrt<ShopGarment>[]): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchDelete: function (ids: string[]): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchRead: function (args: any[]): Promise<OrderCrt<ShopGarment>[]> {
    throw new Error("Function not implemented.");
  },
  batchReadListen: function (args: any[]): {
    items: Ref<OrderCrt<ShopGarment>[]>;
    unsubscribe: () => void;
  } {
    throw new Error("Function not implemented.");
  },
};
