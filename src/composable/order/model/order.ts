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
import { OrderCancel, ORDER_STATE, ProdOrderCombined } from "../domain";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { cloneDeep } from "lodash";

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
  items: ProdOrder[] | ProdOrderCombined[];
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

  setTotalAmount() {
    this.actualAmount = this.items
      .map((x) => x.actualAmount)
      .reduce((prev, acc, idx) => {
        if (idx === 0) {
          acc.shipFeeAmount = prev.shipFeeAmount;
          acc.shipFeeDiscountAmount = prev.shipFeeDiscountAmount;
          acc.tax = prev.tax;
          acc.paidAmount = prev.paidAmount;
          acc.paid = prev.paid; // 미사용
          acc.pureAmount = prev.pureAmount;
          acc.orderAmount = prev.orderAmount;
          acc.paymentConfirm = prev.paymentConfirm;
          acc.paymentMethod = prev.paymentMethod;
          return acc;
        } else {
          acc.shipFeeAmount += prev.shipFeeAmount;
          acc.shipFeeDiscountAmount += prev.shipFeeDiscountAmount;
          acc.tax += prev.tax;
          acc.paidAmount += prev.paidAmount;
          acc.paid = prev.paid;
          acc.pureAmount += prev.pureAmount;
          acc.orderAmount += prev.orderAmount;
          acc.paymentConfirm = prev.paymentConfirm;
          acc.paymentMethod = prev.paymentMethod;
          return acc;
        }
      }, this.actualAmount);
  }

  // getters
  sameOrder(p: OrderCrt): boolean {
    return this.dbId === p.dbId;
  }
  get isValid(): boolean {
    if (this.items.length < 1) return false;
    const amounts = this.items.map((x) => x.actualAmount);
    const amountFieldValid = (n: keyof OrderAmount) =>
      typeof this.actualAmount[n] === "number"
        ? amounts.reduce((prev, acc) => prev + (acc[n] as number), 0) ===
          this.actualAmount[n]
        : true;
    return (
      Object.keys(this.actualAmount)
        .map((k) => amountFieldValid(k as keyof OrderAmount))
        .every((z) => z === true) &&
      this.items
        .map((y) => GarmentOrder.validProdOrder(y))
        .every((k) => k === true)
    );
  }
  get cancelDone(): boolean {
    throw new Error("Method not implemented.");
  }
  get cancelInProcessing(): boolean {
    throw new Error("Method not implemented.");
  }
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
    (this.items as ProdOrder[]).push(newOrder);
    if (update) {
      await this.update();
    }
  }

  static fromProd(p: ShopUserGarment, orderId: string, orderCnt = 1) {
    const pureAmount = GarmentOrder.getPureAmount(orderCnt, p.prodPrice);
    const shipFeeAmount = 0;
    const shipFeeDiscountAmount = 0;
    const tax = 0;
    const paidAmount = 0;

    const amount: OrderAmount = {
      shipFeeAmount,
      shipFeeDiscountAmount,
      tax,
      paidAmount,
      paid: BOOL_M.F,
      pureAmount,
      orderAmount: GarmentOrder.getOrderAmount(
        pureAmount,
        shipFeeAmount,
        shipFeeDiscountAmount,
        tax
      ),
      paymentConfirm: false,
    };
    const prodOrder: ProdOrder = {
      id: uuidv4(),
      vendorId: p.vendorId,
      vendorProdId: p.vendorProdId,
      shopProdId: p.shopProdId,
      orderCnt,
      activeCnt: 1,
      pendingCnt: 0,
      initialAmount: amount,
      actualAmount: amount,
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
  // >>> Prod Order >>>
  setOrderCnt(prodOrderId: string, orderCnt: number, paid = BOOL_M.F) {
    // 0. find prod order
    let itemTarget: ProdOrderCombined | undefined = (
      this.items as ProdOrderCombined[]
    ).find((x) => x.id === prodOrderId);
    if (!itemTarget) throw new Error("prodOrder not belong to order");
    const item = cloneDeep(itemTarget);
    const v = item.vendorGarment;
    // 1. set Order Cnt
    item.orderCnt = orderCnt;
    // 2. set pending cnt
    item.pendingCnt = GarmentOrder.getPendingCnt(
      v.stockCnt,
      orderCnt,
      v.allowPending
    );
    // 3. set activecnt
    item.activeCnt = GarmentOrder.getActiveCnt(orderCnt, item.pendingCnt);
    // 4. set prod order amount
    const pureAmount = GarmentOrder.getPureAmount(orderCnt, v.vendorPrice);
    const newAmount = Object.assign(item.actualAmount, {
      paid,
      pureAmount,
      orderAmount: GarmentOrder.getOrderAmount(
        pureAmount,
        item.actualAmount.shipFeeAmount,
        item.actualAmount.shipFeeDiscountAmount,
        item.actualAmount.tax
      ),
    });
    if (!GarmentOrder.validProdOrder(item)) {
      throw new Error(`Invalid Prod Order: ${JSON.stringify(item)}`);
    }
    itemTarget = item;
    // 5. set order amount
    this.setTotalAmount();
    if (!this.isValid) throw new Error("invalid setTotalAmount in setOrderCnt");
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

  static getPureAmount(orderCnt: number, prodPrice: number) {
    return orderCnt * prodPrice;
  }

  static getOrderAmount(
    pureAmount: number,
    shipFeeAmount: number,
    shipFeeDiscountAmount: number,
    tax: number
  ) {
    return pureAmount - (shipFeeAmount - shipFeeDiscountAmount) + tax;
  }
  static validProdOrder(o: ProdOrder): boolean {
    const cntValid = o.pendingCnt + o.activeCnt === o.orderCnt;
    const a = o.actualAmount;
    const amountValid =
      Object.values(a)
        .map((x) => (typeof x === "number" ? x > 0 : true))
        .every((y) => y === true) && a.orderAmount > a.pureAmount;
    return cntValid && amountValid;
  }
}
