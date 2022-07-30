import {
  OrderAmount,
  OrderCrt,
  OrderParent,
  ProdOrder,
  SHIP_STATE,
  CommonField,
  ShopGarmentCrt,
} from "@/composable";
import { OrderCancel, ORDER_STATE } from "../domain";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { ORDER_DB } from "../db";

export class GarmentOrder
  extends CommonField
  implements OrderCrt<GarmentOrder>
{
  static fromProd(prod: ShopGarmentCrt, orderId: any): GarmentOrder {
    throw new Error("Method not implemented.");
  }
  async update() {
    await ORDER_DB.update(this.dbId);
  }
  orderDate?: Date;
  doneDate?: Date;
  dbId: string;
  orderId: string;
  parent?: OrderParent;
  state: ORDER_STATE;
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  shipping_status: SHIP_STATE;
  items: ProdOrder[];
  subOrderIds: string[]; // db ids
  cancellations: OrderCancel[];

  constructor(d: Partial<OrderCrt<GarmentOrder>>) {
    super(d.createdAt, d.updatedAt);
    this.dbId = d.dbId ?? "";
    this.orderId = d.orderId ?? "";
    this.parent = d.parent;
    this.actualAmount = d.actualAmount!;
    this.initialAmount = d.initialAmount!;
    this.shipping_status = d.shipping_status!;
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

  // 주문량보다 재고량이 많으면: 0
  // 주문량이 더많으면 : 주문량 - 재고량
  setPendingCnt = (stockCnt: number, orderCnt: number, allowPending: boolean) =>
    allowPending ? (stockCnt - orderCnt > 0 ? 0 : orderCnt - stockCnt) : 0;

  getActiveCnt(orderCnt: number, pendingCnt: number) {
    if (orderCnt < 0 || pendingCnt < 0)
      throw new Error("cnt must bigger than zero ");
    else if (orderCnt - pendingCnt < 0) throw new Error("invalid cnt");
    return orderCnt - pendingCnt;
  }

  // >>> set >>>
  async setOrderCnt(prodOrderId: string, orderCnt: number, pendingCnt: number) {
    const item = this.items.find((x) => x.id === prodOrderId);
    if (!item) throw new Error("prodOrderId not exist");
    item.orderCnt = orderCnt;
    item.activeCnt = this.getActiveCnt(orderCnt, pendingCnt);
    item.pendingCnt = pendingCnt;
    await this.update();
  }
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
      activeCnt: this.getActiveCnt(orderCnt, pendingCnt),
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

  static fromJson(d: { [x: string]: any }): GarmentOrder | null {
    return new GarmentOrder({
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      dbId: d.dbId,
      orderId: d.orderId,
      parent: d.parent,
      actualAmount: d.actualAmount,
      initialAmount: d.initialAmount,
      shipping_status: d.shipping_status,
      items: d.items,
      orderDate: d.orderDate,
      subOrderIds: d.subOrderIds,
      state: d.state,
      cancellations: d.cancellations,
    });
  }

  static fireConverter(): FirestoreDataConverter<GarmentOrder | null> {
    return {
      toFirestore: (m: GarmentOrder) => m.toJson(),
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): GarmentOrder | null => {
        const data = snapshot.data(options);
        return data ? GarmentOrder.fromJson(data) : null;
      },
    };
  }

  sameOrder(p: GarmentOrder): boolean {
    return this.dbId === p.dbId;
  }
}
