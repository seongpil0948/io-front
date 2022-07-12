import { getIoCollection } from "@/plugins/firebase";
import { IoCollection } from "@/types";
import { setDoc, doc } from "@firebase/firestore";

export async function setOrderId(
  userId: string,
  orderId: string,
  done = false
): Promise<void> {
  const ioc = getIoCollection({
    c: IoCollection.SHOP_REQ_ORDER_NUMBER,
    uid: userId,
  });
  await setDoc(doc(ioc, orderId.toString()), { done });
}
