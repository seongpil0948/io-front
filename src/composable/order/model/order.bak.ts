// import { VendorUserGarment } from "./../../product/vendor-garment/domain";
// import {
//   BOOL_M,
//   OrderAmount,
//   OrderCrt,
//   OrderParent,
//   OrderItem,
//   ShopUserGarment,
// } from "@/composable";
// import { OrderCancel, ORDER_STATE, OrderItemCombined } from "../domain";
// import { CommonField } from "../../common/model";
// import {
//   FirestoreDataConverter,
//   DocumentSnapshot,
//   DocumentData,
// } from "@firebase/firestore";
// import { uuidv4 } from "@firebase/util";
// import cloneDeep from "lodash.clonedeep";
// import { uniqueArr } from "@/util";
// import { logger } from "@/plugin/logger";
// import { getIoCollection, insertById, IoCollection } from "@io-boxies/js-lib";

// class GarmentOrder extends CommonField implements OrderCrt {
//   orderDate?: Date;
//   doneDate?: Date;
//   dbId: string;
//   orderIds: string[]; // garment order ids
//   itemIds: string[];
//   parent?: OrderParent;
//   states: ORDER_STATE[];
//   amount: OrderAmount;
//   initialAmount: OrderAmount;
//   items: OrderItem[] | OrderItemCombined[];
//   subOrderIds: string[]; // db ids
//   cancellations: OrderCancel[];
//   shopId: string;
//   vendorIds: string[];
//   shipManagerId?: string;

//   constructor(d: OrderCrt) {
//     super(d.createdAt, d.updatedAt);
//     this.dbId = d.dbId!;
//     this.orderIds = d.orderIds!;
//     this.itemIds = d.itemIds!;
//     this.parent = d.parent!;
//     this.shopId = d.shopId!;
//     this.amount = d.amount!;
//     this.initialAmount = d.initialAmount!;
//     this.items = d.items!;
//     this.orderDate = d.orderDate;
//     this.subOrderIds = d.subOrderIds ?? [];
//     this.states = d.states ?? [];
//     this.cancellations = d.cancellations ?? [];
//     this.vendorIds = d.vendorIds ?? [];
//     this.shipManagerId = d.shipManagerId;
//   }

//   setTotalAmount(refreshInitial = true) {
//     this.amount = cloneDeep(this.items)
//       .map((x) => {
//         if (!this.vendorIds.includes(x.vendorId)) {
//           this.vendorIds.push(x.vendorId);
//         }
//         return x.amount;
//       })
//       .reduce((acc, prev, idx) => {
//         if (idx === 0) {
//           acc.shipFeeAmount = prev.shipFeeAmount;
//           acc.shipFeeDiscountAmount = prev.shipFeeDiscountAmount;
//           acc.pickFeeAmount = prev.pickFeeAmount;
//           acc.pickFeeDiscountAmount = prev.pickFeeDiscountAmount;
//           acc.tax = prev.tax;
//           acc.paidAmount = prev.paidAmount;
//           acc.paid = prev.paid; // 미사용
//           acc.pureAmount = prev.pureAmount;
//           acc.orderAmount = prev.orderAmount;
//           acc.paymentConfirm = prev.paymentConfirm;
//           acc.paymentMethod = prev.paymentMethod;
//           return acc;
//         } else {
//           acc.shipFeeAmount += prev.shipFeeAmount;
//           acc.shipFeeDiscountAmount += prev.shipFeeDiscountAmount;
//           acc.pickFeeAmount += prev.pickFeeAmount;
//           acc.pickFeeDiscountAmount += prev.pickFeeDiscountAmount;
//           acc.tax += prev.tax;
//           acc.paidAmount += prev.paidAmount;
//           acc.paid = prev.paid;
//           acc.pureAmount += prev.pureAmount;
//           acc.orderAmount += prev.orderAmount;
//           acc.paymentConfirm = prev.paymentConfirm;
//           acc.paymentMethod = prev.paymentMethod;
//           return acc;
//         }
//       }, cloneDeep(this.amount));
//     if (refreshInitial) {
//       this.initialAmount = cloneDeep(this.amount);
//     }
//   }
//   setState(prodOrderId: string, state: ORDER_STATE) {
//     const ts = this.getProdOrders(prodOrderId);
//     if (ts && ts.length > 0) {
//       // if (!ts[0].history) ts[0].history = [];
//       // console.log(ts[0]);
//       // ts[0].history.push(JSON.parse(JSON.stringify(ts[0])));
//       ts[0].beforeState = ts[0].state;
//       ts[0].state = state;
//       this.states = uniqueArr(this.items.map((x) => x.state));
//     } else {
//       throw new Error(`prodOrderId ${prodOrderId} not exist`);
//     }
//   }
//   // getters
//   getProdOrders(
//     prodOrderId?: string,
//     shopProdId?: string,
//     vendorProdId?: string
//   ) {
//     const orders: OrderItem[] = [];
//     for (let i = 0; i < this.items.length; i++) {
//       const item = this.items[i];
//       if (prodOrderId && prodOrderId === item.id) {
//         orders.push(item);
//         return orders;
//       } else if (shopProdId && item.shopProdId === shopProdId) {
//         orders.push(item);
//       } else if (
//         vendorProdId &&
//         item.vendorProd.vendorProdId === vendorProdId
//       ) {
//         orders.push(item);
//       }
//     }
//     return orders;
//   }

//   sameOrder(p: OrderCrt): boolean {
//     return this.dbId === p.dbId;
//   }
//   get isValid(): boolean {
//     if (this.items.length < 1) return false;
//     const amounts = this.items.map((x) => x.amount);
//     const amountFieldValid = (n: keyof OrderAmount) =>
//       typeof this.amount[n] === "number"
//         ? amounts.reduce((prev, acc) => prev + (acc[n] as number), 0) ===
//           this.amount[n]
//         : true;
//     this.items.forEach((y) => IoOrder.validProdOrder(y as OrderItemCombined));
//     return Object.keys(this.amount)
//       .map((k) => amountFieldValid(k as keyof OrderAmount))
//       .every((z) => z === true);
//   }
//   static empty(): IoOrder {
//     return new IoOrder({
//       dbId: "",
//       shopId: "",
//       vendorIds: [],
//       orderIds: [],
//       itemIds: [],
//       states: ["BEFORE_APPROVE"],
//       amount: emptyAmount(),
//       initialAmount: emptyAmount(),
//       items: [],
//       subOrderIds: [],
//       cancellations: [],
//     });
//   }
//   async update() {
//     return insertById<IoOrder>(
//       this,
//       getIoCollection({ c: IoCollection.ORDER_PROD, uid: this.shopId }),
//       this.dbId,
//       true,
//       IoOrder.fireConverter()
//     );
//   }
//   async reqCancel(arg: OrderCancel) {
//     this.cancellations.push(arg);
//     await this.update();
//   }
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   async doneCancel(arg: any) {
//     await this.update();
//   }
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   async reqOrder(arg: any): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   async doneOrder(arg: any): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   async dividePartial(prodOrderId: string, orderCnt: number, update: boolean) {
//     const item = (this.items as OrderItemCombined[]).find(
//       (x) => x.id === prodOrderId
//     );
//     if (!item) throw new Error("prodOrderId not exist");
//     else if (orderCnt < 0 || orderCnt > item.orderCnt) {
//       throw new Error("invalid Cnt");
//     }
//     const id = uuidv4();
//     const newOrd = cloneDeep(item);
//     newOrd.id = id;
//     (this.items as OrderItemCombined[]).push(newOrd);
//     this.setOrderCnt(id, orderCnt, false, item.amount.paid);
//     const newOrder: OrderItemCombined = (
//       this.items as OrderItemCombined[]
//     ).find((x) => x.id === id)!;
//     // const newOrder: OrderItem = Object.assign({}, item, {
//     //   orderCnt,
//     //   activeCnt: IoOrder.getActiveCnt(orderCnt, pendingCnt),
//     //   pendingCnt,
//     //   id: uuidv4(),
//     // });
//     this.setOrderCnt(
//       item.id,
//       item.orderCnt - newOrder.orderCnt,
//       false,
//       item.amount.paid
//     );

//     if (item.orderCnt < 1) {
//       this.items.splice(
//         this.items.findIndex((x) => x.id === item.id),
//         1
//       );
//       this.itemIds.splice(
//         this.itemIds.findIndex((x) => x === item.id),
//         1
//       );
//     }

//     this.itemIds.push(newOrder.id);
//     if (update) {
//       await this.update();
//     }
//     return newOrder.id;
//   }
//   static isShipping(po: OrderItem) {
//     return [
//       "SHIPPING",
//       "SHIPPING_PENDING",
//       "SHIPPING_WAIT",
//       "SHIPPING_COMPLETE",
//     ].includes(po.state);
//   }
//   static fromProd(
//     p: ShopUserGarment,
//     orderIds: string[],
//     orderCnt = 1,
//     v: VendorUserGarment
//   ) {
//     const pureAmount = IoOrder.getPureAmount(orderCnt, p.prodPrice);
//     const amount = emptyAmount();
//     amount.orderAmount = IoOrder.getOrderAmount(
//       pureAmount,
//       amount.shipFeeAmount,
//       amount.shipFeeDiscountAmount,
//       amount.pickFeeAmount,
//       amount.pickFeeDiscountAmount,
//       amount.tax
//     );
//     const orderDbId = uuidv4();
//     const orderItem: OrderItemCombined = {
//       id: uuidv4(),
//       vendorId: p.vendorId,
//       shopId: p.shopId,
//       orderDbId,
//       vendorProdId: p.vendorProdId,
//       shopProdId: p.shopProdId,
//       orderCnt,
//       activeCnt: orderCnt,
//       pendingCnt: 0,
//       initialAmount: amount,
//       amount: amount,
//       shopProd: p,
//       vendorProd: v,
//       state: "BEFORE_ORDER",
//       history: [],
//       orderType: "STANDARD",
//     };
//     const order = new IoOrder({
//       orderDate: new Date(),
//       doneDate: new Date(),
//       dbId: orderDbId,
//       shopId: p.shopId,
//       orderIds: orderIds,
//       itemIds: [orderItem.id],
//       states: [orderItem.state],
//       amount: amount,
//       initialAmount: amount,
//       items: [orderItem],
//       vendorIds: [orderItem.vendorId],
//       subOrderIds: [],
//       cancellations: [],
//     });
//     order.setOrderCnt(orderItem.id, orderCnt, false);
//     return order;
//   }

//   static fromJson(d: { [x: string]: any }): IoOrder | null {
//     return new IoOrder({
//       createdAt: d.createdAt,
//       updatedAt: d.updatedAt,
//       dbId: d.dbId,
//       orderIds: d.orderIds,
//       itemIds: d.itemIds,
//       parent: d.parent,
//       shopId: d.shopId,
//       amount: d.amount,
//       initialAmount: d.initialAmount,
//       items: d.items,
//       orderDate: d.orderDate,
//       subOrderIds: d.subOrderIds,
//       states: d.states,
//       cancellations: d.cancellations,
//       vendorIds: d.vendorIds,
//       shipManagerId: d.shipManagerId,
//     });
//   }

//   static fireConverter(): FirestoreDataConverter<IoOrder> {
//     return {
//       toFirestore: (m: IoOrder) => {
//         m.updatedAt = new Date();
//         return m instanceof CommonField
//           ? m.toJson()
//           : IoOrder.fromJson(m)!.toJson();
//       },
//       fromFirestore: (
//         snapshot: DocumentSnapshot<DocumentData>,
//         options: any
//       ): IoOrder => {
//         const data = snapshot.data(options);
//         return IoOrder.fromJson(data!)!;
//       },
//     };
//   }
//   // >>> Prod Order >>>
//   setOrderCnt(
//     prodOrderId: string,
//     orderCnt: number,
//     add = true,
//     paid = BOOL_M.F,
//     refreshInitial = true
//   ) {
//     // 0. find prod order
//     const targetIdx = this.items.findIndex((x) => x.id === prodOrderId);
//     if (targetIdx < 0) throw new Error("orderItem not belong to order");
//     const item: OrderItemCombined = (this.items as OrderItemCombined[])[
//       targetIdx
//     ];

//     if (add) {
//       orderCnt += item.orderCnt;
//     }
//     const v = item.vendorProd;
//     // 1. set Order Cnt
//     item.orderCnt = orderCnt;
//     // 2. set pending cnt
//     item.pendingCnt = IoOrder.getPendingCnt(
//       v.stockCnt,
//       orderCnt,
//       v.allowPending
//     );
//     // 3. set active cnt
//     item.activeCnt = IoOrder.getActiveCnt(orderCnt, item.pendingCnt);
//     // 4. set prod order amount
//     const pureAmount = IoOrder.getPureAmount(orderCnt, v.vendorPrice);
//     item.amount.paid = paid;
//     item.amount.pureAmount = pureAmount;
//     item.amount.orderAmount = IoOrder.getOrderAmount(
//       pureAmount,
//       item.amount.shipFeeAmount,
//       item.amount.shipFeeDiscountAmount,
//       item.amount.pickFeeAmount,
//       item.amount.pickFeeDiscountAmount,
//       item.amount.tax
//     );
//     try {
//       IoOrder.validProdOrder(item);
//     } catch (e) {
//       throw new Error(
//         `Invalid Prod Order: ${item.id} orderIds: ${this.dbId}, error: ${e}`
//       );
//     }

//     if (refreshInitial) {
//       item.initialAmount = cloneDeep(item.amount);
//     }
//     // 5. set order amount
//     this.setTotalAmount();
//     if (!this.isValid) {
//       logger.error(null, this);
//       throw new Error("invalid setTotalAmount in setOrderCnt");
//     }
//   }

//   static getActiveCnt(orderCnt: number, pendingCnt: number) {
//     if (orderCnt < 0 || pendingCnt < 0)
//       throw new Error("cnt must bigger than zero ");
//     else if (orderCnt - pendingCnt < 0) throw new Error("invalid cnt");
//     return orderCnt - pendingCnt;
//   }

//   // >>> set >>>
//   // 주문량보다 재고량이 많으면: 0
//   // 주문량이 더많으면 : 주문량 - 재고량
//   static getPendingCnt = (
//     stockCnt: number,
//     orderCnt: number,
//     allowPending: boolean
//   ) => (allowPending ? (stockCnt - orderCnt > 0 ? 0 : orderCnt - stockCnt) : 0);

//   static getPureAmount(orderCnt: number, prodPrice: number) {
//     return orderCnt * prodPrice;
//   }

//   static getOrderAmount(
//     pureAmount: number,
//     shipFeeAmount: number,
//     shipFeeDiscountAmount: number,
//     pickFeeAmount: number,
//     pickFeeDiscountAmount: number,
//     tax: number
//   ) {
//     return (
//       pureAmount +
//       (shipFeeAmount - shipFeeDiscountAmount) +
//       (pickFeeAmount - pickFeeDiscountAmount) +
//       tax
//     );
//   }
//   static validProdOrder(o: OrderItemCombined): void {
//     const a = o.amount;
//     if (!(o.pendingCnt + o.activeCnt === o.orderCnt)) {
//       throw new Error("invalid count");
//     } else if (!(a.orderAmount > 0 && a.orderAmount >= a.pureAmount)) {
//       throw new Error("invalid amount");
//     } else if (
//       o.pendingCnt > 0 &&
//       o.vendorProd &&
//       !o.vendorProd.allowPending
//     ) {
//       throw new Error("invalid allowPending");
//     }
//   }
// }
// export function mergeProdOrder(origin: OrderItem, y: OrderItem) {
//   origin.orderCnt += y.orderCnt;
//   origin.activeCnt += y.activeCnt;
//   origin.pendingCnt += y.pendingCnt;
//   mergeOrderAmount(origin.amount, y.amount);
//   mergeOrderAmount(origin.initialAmount, y.initialAmount);
// }

// export function mergeOrderAmount(origin: OrderAmount, y: OrderAmount) {
//   origin.shipFeeAmount += y.shipFeeAmount;
//   origin.shipFeeDiscountAmount += y.shipFeeDiscountAmount;
//   origin.pickFeeAmount += y.pickFeeAmount;
//   origin.pickFeeDiscountAmount += y.pickFeeDiscountAmount;
//   origin.tax += y.tax;
//   origin.paidAmount += y.paidAmount;
//   origin.paid = y.paid;
//   origin.pureAmount += y.pureAmount;
//   origin.orderAmount += y.orderAmount;
//   origin.paymentConfirm = y.paymentConfirm;
//   origin.paymentMethod = y.paymentMethod;
// }

// export function emptyAmount(): OrderAmount {
//   return {
//     shipFeeAmount: 0,
//     shipFeeDiscountAmount: 0,
//     pickFeeAmount: 0,
//     pickFeeDiscountAmount: 0,
//     tax: 0,
//     paidAmount: 0,
//     paid: BOOL_M.F,
//     pureAmount: 0,
//     orderAmount: 0,
//     paymentConfirm: false,
//   };
// }

// export function emptyProdOrder(): OrderItem {
//   return {
//     id: "",
//     vendorId: "",
//     vendorProdId: "",
//     shopProdId: "",
//     orderCnt: 0,
//     activeCnt: 0,
//     pendingCnt: 0,
//     amount: emptyAmount(),
//     initialAmount: emptyAmount(),
//     state: "BEFORE_ORDER",
//     shopId: "",
//     orderDbId: "",
//     history: [],
//     orderType: "STANDARD",
//   };
// }
