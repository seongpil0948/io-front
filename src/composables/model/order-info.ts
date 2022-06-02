import { dateToTimeStamp, getIoCollection, loadDate } from "@/plugins/firebase";
import {
  type PROD_SIZE,
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
import { CommonField } from ".";

class ShopReqOrder extends CommonField {
  // 쇼핑몰, 도매처 모두 정보를 수정할 수 있되 서로의 허용이 필요한 사항이다.
  orderId: string;
  vendorId: string;
  vendorProdId: string;
  shopId: string;
  shopProdId: string;
  color: string;
  size: PROD_SIZE;
  orderCount: number;
  amount: number;
  stockCnt: number;
  orderState: ORDER_STATE;
  preOrderCount: number;

  constructor(data: ShopReqOrderCRT) {
    super(data.createdAt, data.updatedAt);
    this.orderId = data.orderId;
    this.vendorId = data.vendorId;
    this.vendorProdId = data.vendorProdId;
    this.shopId = data.shopId;
    this.shopProdId = data.shopProdId;
    this.color = data.color;
    this.size = data.size;
    this.orderCount = data.orderCount;
    this.amount = data.amount;
    this.stockCnt = data.stockCnt;
    this.orderState = data.orderState;
    this.preOrderCount = data.preOrderCount;
  }
  async update(clear = false) {
    const shopReqRef = getIoCollection({
      c: IoCollection.SHOP_REQ_ORDER_PROD,
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
        throw `Error doing get ShopReqOrder docoument ${this.shopId} ${this.shopProdId}`;
      data.orderCount += this.orderCount;
      data.amount += this.amount;
      await setDoc(docRef, data, { merge: true });
    } else {
      await setDoc(docRef, this);
    }
  }

  static fromProd(p: ShopUserProd, orderId: string) {
    return new ShopReqOrder(
      Object.assign(
        {
          orderId: orderId,
          amount: p.prodPrice,
          orderCount: 1,
          orderState: ORDER_STATE.BEFORE_ORDER,
          preOrderCount: 0,
        },
        p
      )
    );
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
          color: data.color,
          size: data.size,
          orderCount: data.orderCount,
          amount: data.amount,
          stockCnt: data.stockCnt,
          orderState: data.orderState,
          preOrderCount: data.preOrderCount,
        })
      : null;
  }
}
export const shopReqOrderConverter = {
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

export { ShopReqOrder };
