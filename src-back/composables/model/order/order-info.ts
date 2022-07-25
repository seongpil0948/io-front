import { CommonField } from "@/composables";
import {
  dateToTimeStamp,
  getIoCollection,
  loadDate,
  setOrderId,
} from "@/plugins/firebase";
import {
  ORDER_STATE,
  type ShopReqOrderCRT,
  IoCollection,
  type ShopUserProd,
} from "@/types";
import {
  doc,
  type DocumentData,
  type DocumentSnapshot,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

class ShopReqOrder extends CommonField implements ShopReqOrderCRT {
  // Both Shop and Vendor can Modify This Information
  // But Mutual Consent is Required
  dbId: string;
  orderId: string;
  vendorId: string;
  vendorProdId: string;
  shopId: string;
  shopProdId: string;
  orderCnt: number; // 총 주문 개수
  activeCnt: number; // 배송가능 개수 (총 주문 개수 - 미송 개수)
  pendingCnt: number; // 미송 개수
  amount: number; // 주문 금액
  amountPaid: number; // 결제 완료 금액
  orderState: ORDER_STATE;
  waitApprove: boolean;

  constructor(data: ShopReqOrderCRT) {
    super(data.createdAt, data.updatedAt);
    this.dbId = data.dbId;
    this.orderId = data.orderId;
    this.vendorId = data.vendorId;
    this.vendorProdId = data.vendorProdId;
    this.shopId = data.shopId;
    this.shopProdId = data.shopProdId;
    this.orderCnt = data.orderCnt;
    this.activeCnt = data.activeCnt;
    this.pendingCnt = data.pendingCnt;
    this.amount = data.amount;
    this.amountPaid = data.amountPaid;
    this.orderState = data.orderState;
    this.waitApprove = data.waitApprove;
  }
  static none() {
    return new ShopReqOrder({
      dbId: "",
      orderId: "",
      vendorId: "",
      vendorProdId: "",
      shopId: "",
      shopProdId: "",
      orderCnt: 0,
      activeCnt: 0,
      pendingCnt: 0,
      amount: 0,
      amountPaid: 0,
      orderState: ORDER_STATE.BEFORE_ORDER,
      waitApprove: false,
    });
  }
  get unPaidAmount() {
    return this.amount - this.amountPaid;
  }

  sameOrder(p: ShopReqOrder) {
    return (
      this.shopProdId === p.shopProdId &&
      this.shopId === p.shopId &&
      this.orderState === p.orderState
    );
  }

  async update(fields?: (keyof ShopReqOrderCRT)[]) {
    const shopReqRef = getIoCollection({
      c: IoCollection.SHOP_REQ_ORDER,
      uid: this.shopId,
      orderId: this.orderId,
    });
    const docRef = doc(shopReqRef, this.dbId).withConverter(
      shopReqOrderConverter
    );

    if (fields) {
      await setDoc(
        docRef,
        fields.reduce((acc, field) => {
          acc[field] = this[field];
          return acc;
        }, {} as any),
        { merge: true }
      );
    } else {
      const d = await getDoc(docRef);
      const data = d.data();
      if (data) {
        await setDoc(docRef, this, { merge: true });
        await setOrderId(this.shopId, this.orderId);
      } else {
        await setDoc(docRef, this);
        await setOrderId(this.shopId, this.orderId);
      }
    }
  }

  static fromProd(p: ShopUserProd, orderId: string) {
    const orderCnt = 1;
    return new ShopReqOrder({
      dbId: uuidv4(),
      orderId: orderId,
      vendorId: p.vendorId,
      vendorProdId: p.vendorProdId,
      shopId: p.shopId,
      shopProdId: p.shopProdId,
      orderCnt: orderCnt,
      activeCnt: 1,
      pendingCnt: 0,
      amount: orderCnt * p.prodPrice,
      amountPaid: 0,
      orderState: ORDER_STATE.BEFORE_ORDER,
      waitApprove: false,
    });
  }
  static fromJson(data: { [x: string]: any }): ShopReqOrder | null {
    return data && data.vendorProdId
      ? new ShopReqOrder({
          createdAt: loadDate(data.createdAt ?? null),
          updatedAt: loadDate(data.updatedAt ?? null),
          dbId: data.dbId,
          orderId: data.orderId,
          vendorId: data.vendorId,
          vendorProdId: data.vendorProdId,
          shopId: data.shopId,
          shopProdId: data.shopProdId,
          orderCnt: data.orderCnt,
          activeCnt: data.activeCnt,
          pendingCnt: data.pendingCnt,
          amount: data.amount,
          amountPaid: data.amountPaid,
          orderState: data.orderState,
          waitApprove: data.waitApprove,
        })
      : null;
  }

  copyWith(d: Partial<ShopReqOrderCRT>) {
    return new ShopReqOrder({
      createdAt: d.createdAt ?? this.createdAt,
      updatedAt: d.updatedAt ?? this.updatedAt,
      dbId: d.dbId ?? this.dbId,
      orderId: d.orderId ?? this.orderId,
      vendorId: d.vendorId ?? this.vendorId,
      vendorProdId: d.vendorProdId ?? this.vendorProdId,
      shopId: d.shopId ?? this.shopId,
      shopProdId: d.shopProdId ?? this.shopProdId,
      orderCnt: d.orderCnt ?? this.orderCnt,
      activeCnt: d.activeCnt ?? this.activeCnt,
      pendingCnt: d.pendingCnt ?? this.pendingCnt,
      amount: d.amount ?? this.amount,
      amountPaid: d.amountPaid ?? this.amountPaid,
      orderState: d.orderState ?? this.orderState,
      waitApprove: d.waitApprove ?? this.waitApprove,
    });
  }
}

const shopReqOrderConverter = {
  toFirestore: (p: ShopReqOrder) => {
    const j = p.toJson();
    j.createdAt = dateToTimeStamp(p.createdAt);
    j.updatedAt = dateToTimeStamp(p.updatedAt);
    return j;
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>
  ): ShopReqOrder | null => {
    const data = snapshot.data();
    if (!data || !data.vendorProdId) return null;
    return ShopReqOrder.fromJson(data);
  },
};
export const orderAble = (
  stockCnt: number,
  orderCnt: number,
  pendingCnt: number
) => {
  return stockCnt + pendingCnt >= orderCnt;
};
export { ShopReqOrder, shopReqOrderConverter };
