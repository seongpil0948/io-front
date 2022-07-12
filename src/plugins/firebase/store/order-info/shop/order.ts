import {
  vendorProdConverter,
  shopReqOrderConverter,
  getPendingCnt,
  orderAble,
} from "@/composables";
import { getIoCollection, iostore } from "@/plugins/firebase";
import { logger as log } from "@/plugins/logger";
import {
  ShopReqOrderJoined,
  IoCollection,
  VendorOperInfo,
  ORDER_STATE,
} from "@/types";
import { doc, runTransaction } from "@firebase/firestore";

export async function orderVendorProd(row: ShopReqOrderJoined) {
  try {
    const shopReqRef = getIoCollection({
      c: IoCollection.SHOP_REQ_ORDER,
      uid: row.shopId,
      orderId: row.orderId,
    });
    const vendorProdRef = getIoCollection({
      c: IoCollection.VENDOR_PROD,
    }).withConverter(vendorProdConverter);
    const ordRef = doc(shopReqRef, row.dbId).withConverter(
      shopReqOrderConverter
    );
    const newOrder = await runTransaction(iostore, async (transaction) => {
      const ordDoc = await transaction.get(ordRef);
      const vendorProdDoc = await transaction.get(
        doc(vendorProdRef, row.vendorProdId)
      );
      if (!ordDoc.exists()) throw "order doc does not exist!";
      else if (!vendorProdDoc.exists()) throw "vendor prod doc does not exist!";
      const ord = ordDoc.data()!;
      const prod = vendorProdDoc.data()!;
      ord.pendingCnt = prod.allowPending
        ? getPendingCnt(prod.stockCnt, ord.orderCnt)
        : 0;
      ord.amount = ord.orderCnt * prod.vendorPrice;
      if ((row.operInfo as VendorOperInfo).autoOrderApprove) {
        ord.orderState = ORDER_STATE.BEFORE_PAYMENT;
      } else {
        ord.orderState = ORDER_STATE.BEFORE_APPROVE;
        ord.waitApprove = true;
      }
      if (!orderAble(prod.stockCnt, ord.orderCnt, ord.pendingCnt)) {
        throw "미송 + 재고의 수량이 주문 수량보다 적습니다.";
      }
      transaction.update(ordRef, shopReqOrderConverter.toFirestore(ord));
      return ord;
    });
    return newOrder;
  } catch (e) {
    log.error(null, e);
    throw e;
  }
}
