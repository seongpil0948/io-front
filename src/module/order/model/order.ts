import {
  CancelInfo,
  OrderAmount,
  OrderCrt,
  OrderParent,
  ProdOrder,
  SHIP_STATE,
  CommonField,
} from "@/module";

export class GarmentOrder
  extends CommonField
  implements OrderCrt<GarmentOrder>
{
  dbId: string;
  orderId: string;
  parent?: OrderParent;
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  shipping_status: SHIP_STATE;
  items: ProdOrder[];
  orderDate: Date;
  subOrderIds: string[]; // db ids
  canceled: boolean;
  cancelDate?: string;
  cancelReqDate?: string;
  cancellation?: CancelInfo[];
  exchangeDate?: string;
  exchangeReqDate?: string;

  constructor(d: OrderCrt<GarmentOrder>) {
    super(d.createdAt, d.updatedAt);
    this.dbId = d.dbId;
    this.orderId = d.orderId;
    this.parent = d.parent;
    this.actualAmount = d.actualAmount;
    this.initialAmount = d.initialAmount;
    this.shipping_status = d.shipping_status;
    this.items = d.items;
    this.orderDate = d.orderDate;
    this.subOrderIds = d.subOrderIds;
    this.canceled = d.canceled;
    this.cancelDate = d.cancelDate;
    this.cancelReqDate = d.cancelReqDate;
    this.cancellation = d.cancellation;
    this.exchangeDate = d.exchangeDate;
    this.exchangeReqDate = d.exchangeReqDate;
  }
  reqExchange(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  doneExchange(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  reqCancel(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  doneCancel(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  reqOrder(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  doneOrder(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  dividePartial(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  sameOrder(p: GarmentOrder): boolean {
    return this.dbId === p.dbId;
  }
}
