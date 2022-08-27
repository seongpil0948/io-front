import { VendorUserGarment } from "./../../product/vendor-garment/domain";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonField } from "@/composable/common/model";
import {
  BOOL_M,
  OrderAmount,
  OrderCrt,
  OrderParent,
  ProdOrder,
  ShopUserGarment,
  SHIP_METHOD,
  Locate,
} from "@/composable";
import { OrderCancel, ORDER_STATE, ProdOrderCombined } from "../domain";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { cloneDeep } from "lodash";
import { insertById, getIoCollection, IoCollection } from "@/util";
import { logger } from "@/plugin/logger";

export class GarmentOrder extends CommonField implements OrderCrt {
  orderDate?: Date;
  doneDate?: Date;
  dbId: string;
  orderIds: string[]; // garment order ids
  itemIds: string[];
  parent?: OrderParent;
  states: ORDER_STATE[];
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  items: ProdOrder[] | ProdOrderCombined[];
  subOrderIds: string[]; // db ids
  cancellations: OrderCancel[];
  shopId: string;
  vendorIds: string[];
  shipManagerId?: string;

  constructor(d: OrderCrt) {
    super(d.createdAt, d.updatedAt);
    this.dbId = d.dbId!;
    this.orderIds = d.orderIds!;
    this.itemIds = d.itemIds!;
    this.parent = d.parent!;
    this.shopId = d.shopId!;
    this.actualAmount = d.actualAmount!;
    this.initialAmount = d.initialAmount!;
    this.items = d.items!;
    this.orderDate = d.orderDate;
    this.subOrderIds = d.subOrderIds ?? [];
    this.states = d.states ?? [];
    this.cancellations = d.cancellations ?? [];
    this.vendorIds = d.vendorIds ?? [];
    this.shipManagerId = d.shipManagerId;
  }

  setTotalAmount(refreshInitial = true) {
    this.actualAmount = cloneDeep(this.items)
      .map((x) => {
        if (!this.vendorIds.includes(x.vendorId)) {
          this.vendorIds.push(x.vendorId);
        }
        return x.actualAmount;
      })
      .reduce((acc, prev, idx) => {
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
      }, cloneDeep(this.actualAmount));
    if (refreshInitial) {
      this.initialAmount = cloneDeep(this.actualAmount);
    }
  }
  setState(prodOrderId: string, state: ORDER_STATE) {
    const ts = this.getProdOrders(prodOrderId);
    if (ts && ts.length > 0) {
      this.states.splice(
        this.states.findIndex((x) => ts[0].state),
        1
      );
      ts[0].state = state;
      this.states.push(state);
    }
  }
  // getters
  getProdOrders(
    prodOrderId?: string,
    shopProdId?: string,
    vendorProdId?: string
  ) {
    // deep copy
    const orders: ProdOrder[] = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (prodOrderId && prodOrderId === item.id) {
        orders.push(item);
        return orders;
      } else if (shopProdId && item.shopProdId === shopProdId) {
        orders.push(item);
      } else if (vendorProdId && item.vendorProdId === vendorProdId) {
        orders.push(item);
      }
      return orders;
    }
  }

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
    this.items.forEach((y) =>
      GarmentOrder.validProdOrder(y as ProdOrderCombined)
    );
    return Object.keys(this.actualAmount)
      .map((k) => amountFieldValid(k as keyof OrderAmount))
      .every((z) => z === true);
  }
  static empty(): GarmentOrder {
    return new GarmentOrder({
      dbId: "",
      shopId: "",
      vendorIds: [],
      orderIds: [],
      itemIds: [],
      states: ["BEFORE_APPROVE"],
      actualAmount: emptyAmount(),
      initialAmount: emptyAmount(),
      items: [],
      subOrderIds: [],
      cancellations: [],
    });
  }
  async update() {
    return insertById<GarmentOrder>(
      this,
      getIoCollection({ c: IoCollection.ORDER_PROD, uid: this.shopId }),
      this.dbId,
      true,
      GarmentOrder.fireConverter()
    );
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

  static fromProd(
    p: ShopUserGarment,
    orderIds: string[],
    orderCnt = 1,
    v: VendorUserGarment
  ) {
    const pureAmount = GarmentOrder.getPureAmount(orderCnt, p.prodPrice);
    const amount = emptyAmount();
    amount.orderAmount = GarmentOrder.getOrderAmount(
      pureAmount,
      amount.shipFeeAmount,
      amount.shipFeeDiscountAmount,
      amount.tax
    );

    const prodOrder: ProdOrderCombined = {
      id: uuidv4(),
      vendorId: p.vendorId,
      vendorProdId: p.vendorProdId,
      shopProdId: p.shopProdId,
      orderCnt,
      activeCnt: orderCnt,
      pendingCnt: 0,
      initialAmount: amount,
      actualAmount: amount,
      shopGarment: p,
      vendorGarment: v,
      state: "BEFORE_ORDER",
    };
    const order = new GarmentOrder({
      orderDate: new Date(),
      doneDate: new Date(),
      dbId: uuidv4(),
      shopId: p.shopId,
      orderIds: orderIds,
      itemIds: [prodOrder.id],
      states: [prodOrder.state],
      actualAmount: amount,
      initialAmount: amount,
      items: [prodOrder],
      vendorIds: [prodOrder.vendorId],
      subOrderIds: [],
      cancellations: [],
    });
    order.setOrderCnt(prodOrder.id, orderCnt, false);
    return order;
  }

  static fromJson(d: { [x: string]: any }): GarmentOrder | null {
    return new GarmentOrder({
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      dbId: d.dbId,
      orderIds: d.orderIds,
      itemIds: d.itemIds,
      parent: d.parent,
      shopId: d.shopId,
      actualAmount: d.actualAmount,
      initialAmount: d.initialAmount,
      items: d.items,
      orderDate: d.orderDate,
      subOrderIds: d.subOrderIds,
      states: d.states,
      cancellations: d.cancellations,
      vendorIds: d.vendorIds,
      shipManagerId: d.shipManagerId,
    });
  }

  static fireConverter(): FirestoreDataConverter<GarmentOrder> {
    return {
      toFirestore: (m: GarmentOrder) => {
        m.updatedAt = new Date();
        return m instanceof CommonField
          ? m.toJson()
          : GarmentOrder.fromJson(m)!.toJson();
      },
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): GarmentOrder => {
        const data = snapshot.data(options);
        return GarmentOrder.fromJson(data!)!;
      },
    };
  }
  // >>> Prod Order >>>
  setOrderCnt(
    prodOrderId: string,
    orderCnt: number,
    add = true,
    paid = BOOL_M.F,
    refreshInitial = true
  ) {
    // 0. find prod order
    const targetIdx = this.items.findIndex((x) => x.id === prodOrderId);
    if (targetIdx < 0) throw new Error("prodOrder not belong to order");
    const item: ProdOrderCombined = (this.items as ProdOrderCombined[])[
      targetIdx
    ];

    if (add) {
      orderCnt += item.orderCnt;
    }
    const v = item.vendorGarment;
    // 1. set Order Cnt
    item.orderCnt = orderCnt;
    // 2. set pending cnt
    item.pendingCnt = GarmentOrder.getPendingCnt(
      v.stockCnt,
      orderCnt,
      v.allowPending
    );
    // 3. set active cnt
    item.activeCnt = GarmentOrder.getActiveCnt(orderCnt, item.pendingCnt);
    // 4. set prod order amount
    const pureAmount = GarmentOrder.getPureAmount(orderCnt, v.vendorPrice);
    item.actualAmount.paid = paid;
    item.actualAmount.pureAmount = pureAmount;
    item.actualAmount.orderAmount = GarmentOrder.getOrderAmount(
      pureAmount,
      item.actualAmount.shipFeeAmount,
      item.actualAmount.shipFeeDiscountAmount,
      item.actualAmount.tax
    );
    try {
      GarmentOrder.validProdOrder(item);
    } catch (e) {
      throw new Error(
        `Invalid Prod Order: ${item.id} orderIds: ${this.dbId}, error: ${e}`
      );
    }

    if (refreshInitial) {
      item.initialAmount = cloneDeep(item.actualAmount);
    }
    // 5. set order amount
    this.setTotalAmount();
    if (!this.isValid) {
      logger.error(null, this);
      throw new Error("invalid setTotalAmount in setOrderCnt");
    }
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
  static validProdOrder(o: ProdOrderCombined): void {
    const a = o.actualAmount;
    if (!(o.pendingCnt + o.activeCnt === o.orderCnt)) {
      throw new Error("invalid count");
    } else if (!(a.orderAmount > 0 && a.orderAmount >= a.pureAmount)) {
      throw new Error("invalid amount");
    } else if (o.pendingCnt > 0 && !o.vendorGarment.allowPending) {
      throw new Error("invalid allowPending");
    }
  }
}
export function mergeProdOrder(origin: ProdOrder, y: ProdOrder) {
  origin.orderCnt += y.orderCnt;
  origin.activeCnt += y.activeCnt;
  origin.pendingCnt += y.pendingCnt;
  mergeOrderAmount(origin.actualAmount, y.actualAmount);
  mergeOrderAmount(origin.initialAmount, y.initialAmount);
}

export function mergeOrderAmount(origin: OrderAmount, y: OrderAmount) {
  origin.shipFeeAmount += y.shipFeeAmount;
  origin.shipFeeDiscountAmount += y.shipFeeDiscountAmount;
  origin.tax += y.tax;
  origin.paidAmount += y.paidAmount;
  origin.paid = y.paid;
  (origin.pureAmount += y.pureAmount), (origin.orderAmount += y.orderAmount);
  origin.paymentConfirm = y.paymentConfirm;
  origin.paymentMethod = y.paymentMethod;
}

export function emptyAmount(): OrderAmount {
  return {
    shipFeeAmount: 0,
    shipFeeDiscountAmount: 0,
    tax: 0,
    paidAmount: 0,
    paid: BOOL_M.F,
    pureAmount: 0,
    orderAmount: 0,
    paymentConfirm: false,
  };
}

export function emptyProdOrder(): ProdOrder {
  return {
    id: "",
    vendorId: "",
    vendorProdId: "",
    shopProdId: "",
    orderCnt: 0,
    activeCnt: 0,
    pendingCnt: 0,
    actualAmount: emptyAmount(),
    initialAmount: emptyAmount(),
    state: "BEFORE_ORDER",
  };
}
