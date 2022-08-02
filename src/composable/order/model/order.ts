/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonField } from "@/composable/common/model";
import {
  BOOL_M,
  OrderAmount,
  OrderCrt,
  OrderParent,
  ProdOrder,
  SHIP_STATE,
  ShopUserGarment,
} from "@/composable";
import { OrderCancel, ORDER_STATE } from "../domain";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { ORDER_GARMENT_DB } from "../db";
import { v4 as uuidv4 } from "uuid";

export class GarmentOrder extends CommonField implements OrderCrt {
  orderDate?: Date;
  doneDate?: Date;
  dbId: string;
  orderId: string;
  parent?: OrderParent;
  state: ORDER_STATE;
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  shippingStatus: SHIP_STATE;
  items: ProdOrder[];
  subOrderIds: string[]; // db ids
  cancellations: OrderCancel[];
  shopId: string;

  constructor(d: Partial<OrderCrt>) {
    super(d.createdAt, d.updatedAt);
    this.dbId = d.dbId!;
    this.orderId = d.orderId!;
    this.parent = d.parent!;
    this.shopId = d.shopId!;
    this.actualAmount = d.actualAmount!;
    this.initialAmount = d.initialAmount!;
    this.shippingStatus = d.shippingStatus!;
    this.items = d.items!;
    this.orderDate = d.orderDate;
    this.subOrderIds = d.subOrderIds ?? [];
    this.state = d.state!;
    this.cancellations = d.cancellations ?? [];
  }
  // >>> get >>>
  get cancelDone(): boolean {
    throw new Error("Method not implemented.");
  }
  get cancelInProcessing(): boolean {
    throw new Error("Method not implemented.");
  }
  static getActiveCnt(orderCnt: number, pendingCnt: number) {
    if (orderCnt < 0 || pendingCnt < 0)
      throw new Error("cnt must bigger than zero ");
    else if (orderCnt - pendingCnt < 0) throw new Error("invalid cnt");
    return orderCnt - pendingCnt;
  }

  // >>> set >>>
  // 주문량보다 재고량이 많으면: 0
  // 주문량이 더많으면 : 주문량 - 재고량
  static getPendingCnt = (
    stockCnt: number,
    orderCnt: number,
    allowPending: boolean
  ) => (allowPending ? (stockCnt - orderCnt > 0 ? 0 : orderCnt - stockCnt) : 0);
  // async setOrderCnt(prodOrderId: string, orderCnt: number, pendingCnt: number) {
  //   const item = this.items.find((x) => x.id === prodOrderId);
  //   if (!item) throw new Error("prodOrderId not exist");
  //   item.orderCnt = orderCnt;
  //   item.activeCnt = this.getActiveCnt(orderCnt, pendingCnt);
  //   item.pendingCnt = pendingCnt;
  //   await this.update();
  // }
  // >>> process >>>
  async reqCancel(arg: OrderCancel) {
    this.cancellations.push(arg);
    await this.update();
  }
  async doneCancel(arg: any) {
    await this.update();
  }
  async reqOrder(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async doneOrder(arg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async dividePartial(
    prodOrderId: string,
    orderCnt: number,
    pendingCnt: number,
    update: boolean
  ) {
    const item = this.items.find((x) => x.id === prodOrderId);
    if (!item) throw new Error("prodOrderId not exist");
    const newOrder: ProdOrder = Object.assign({}, item, {
      orderCnt,
      activeCnt: GarmentOrder.getActiveCnt(orderCnt, pendingCnt),
      pendingCnt,
    });
    item.orderCnt -= newOrder.orderCnt;
    item.activeCnt -= newOrder.activeCnt;
    item.pendingCnt -= newOrder.pendingCnt;
    this.items.push(newOrder);
    if (update) {
      await this.update();
    }
  }

  static fromProd(p: ShopUserGarment, orderId: string, orderCnt = 1) {
    const priceAmount = orderCnt * p.prodPrice;
    const shipFeeAmount = 0;
    const shipFeeDiscountAmount = 0;
    const tax = 0;
    const paidAmount = 0;
    const prodOrder: ProdOrder = {
      id: uuidv4(),
      vendorId: p.vendorId,
      vendorProdId: p.vendorProdId,
      shopProdId: p.shopProdId,
      orderCnt,
      activeCnt: 1,
      pendingCnt: 0,
    };
    const amount: OrderAmount = {
      shipFeeAmount,
      shipFeeDiscountAmount,
      tax,
      paidAmount,
      paid: BOOL_M.F,
      pureAmount: priceAmount,
      orderAmount: priceAmount - (shipFeeAmount - shipFeeDiscountAmount) + tax,
      paymentConfirm: false,
    };

    return new GarmentOrder({
      orderDate: new Date(),
      doneDate: new Date(),
      dbId: uuidv4(),
      shopId: p.shopId,
      orderId: orderId,
      state: "BEFORE_ORDER",
      actualAmount: amount,
      initialAmount: amount,
      shippingStatus: SHIP_STATE.BEFORE_READY,
      items: [prodOrder],
    });
  }

  static fromJson(d: { [x: string]: any }): GarmentOrder | null {
    return new GarmentOrder({
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      dbId: d.dbId,
      orderId: d.orderId,
      parent: d.parent,
      shopId: d.shopId,
      actualAmount: d.actualAmount,
      initialAmount: d.initialAmount,
      shippingStatus: d.shippingStatus,
      items: d.items,
      orderDate: d.orderDate,
      subOrderIds: d.subOrderIds,
      state: d.state,
      cancellations: d.cancellations,
    });
  }

  static fireConverter(): FirestoreDataConverter<GarmentOrder | null> {
    return {
      toFirestore: (m: GarmentOrder) => {
        return m instanceof CommonField
          ? m.toJson()
          : GarmentOrder.fromJson(m)!.toJson();
      },
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): GarmentOrder | null => {
        const data = snapshot.data(options);
        return data ? GarmentOrder.fromJson(data) : null;
      },
    };
  }

  sameOrder(p: OrderCrt): boolean {
    return this.dbId === p.dbId;
  }
}
