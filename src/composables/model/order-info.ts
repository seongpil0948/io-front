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
  getDoc,
  type DocumentData,
  type DocumentSnapshot,
  setDoc,
} from "firebase/firestore";
import { CommonField } from "./common";

class ShopReqOrder extends CommonField {
  // Both Shop and Vendor can Modify This Information
  // But Mutual Consent is Required
  orderId: string;
  vendorId: string;
  vendorProdId: string;
  shopId: string;
  shopProdId: string;
  orderCnt: number;
  activeCnt: number;
  pendingCnt: number;
  amount: number;
  orderState: ORDER_STATE;
  waitApprove: boolean;

  constructor(data: ShopReqOrderCRT) {
    super(data.createdAt, data.updatedAt);
    this.orderId = data.orderId;
    this.vendorId = data.vendorId;
    this.vendorProdId = data.vendorProdId;
    this.shopId = data.shopId;
    this.shopProdId = data.shopProdId;
    this.orderCnt = data.orderCnt;
    this.activeCnt = data.activeCnt;
    this.pendingCnt = data.pendingCnt;
    this.amount = data.amount;
    this.orderState = data.orderState;
    this.waitApprove = data.waitApprove;
  }
  // async archive(): Promise<void> {
  //   return Error("Not Implemented");
  //   // TODO
  //   // 주문 완료된 상품은 다음 주문을 위해 없어져야하지만
  //   // 내역을 저장을 위해 archive 컬렉션으로 이동해야한다.
  // }
  async update(clear = false) {
    const shopReqRef = getIoCollection({
      c: IoCollection.SHOP_REQ_ORDER,
      uid: this.shopId,
      orderId: this.orderId,
    });
    const docRef = doc(shopReqRef, this.shopProdId).withConverter(
      shopReqOrderConverter
    );
    const d = await getDoc(docRef);
    let data = d.data();
    if (data && !clear) {
      data = ShopReqOrder.fromJson(data);
      if (!data)
        throw `ShopReqOrder docoument Aleady Exist ${this.shopId} ${this.shopProdId}`;
      await setDoc(
        docRef,
        { orderCnt: data.orderCnt + this.orderCnt, amount: this.amount },
        { merge: true }
      );
    } else {
      await setDoc(docRef, this);
      await setOrderId(this.shopId, this.orderId);
    }
  }

  static fromProd(p: ShopUserProd, orderId: string) {
    const orderCnt = 1;
    return new ShopReqOrder({
      orderId: orderId,
      vendorId: p.vendorId,
      vendorProdId: p.vendorProdId,
      shopId: p.shopId,
      shopProdId: p.shopProdId,
      orderCnt: orderCnt,
      activeCnt: 1,
      pendingCnt: 0,
      amount: orderCnt * p.prodPrice,
      orderState: ORDER_STATE.BEFORE_ORDER,
      waitApprove: false,
    });
  }
  static fromJson(data: { [x: string]: any }): ShopReqOrder | null {
    return data && data.vendorProdId
      ? new ShopReqOrder({
          createdAt: loadDate(data.createdAt ?? null),
          updatedAt: loadDate(data.updatedAt ?? null),
          orderId: data.orderId,
          vendorId: data.vendorId,
          vendorProdId: data.vendorProdId,
          shopId: data.shopId,
          shopProdId: data.shopProdId,
          orderCnt: data.orderCnt,
          activeCnt: data.activeCnt,
          pendingCnt: data.pendingCnt,
          amount: data.amount,
          orderState: data.orderState,
          waitApprove: data.waitApprove,
        })
      : null;
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

export { ShopReqOrder, shopReqOrderConverter };
