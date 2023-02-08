import {
  IoShipment,
  IoOrder,
  IO_PAY_DB,
  ShipDB,
  isValidOrder,
  setState,
  VENDOR_GARMENT_DB,
  PayHistoryCRT,
  USER_DB,
  checkOrderShipLocate,
  validateUser,
} from "@/composable";
import {
  getIoCollection,
  IoCollection,
  userFireConverter,
} from "@io-boxies/js-lib";
import { uuidv4 } from "@firebase/util";
import { doc, runTransaction } from "firebase/firestore";
import { getSrc } from "./order";
import { ioFireStore } from "@/plugin/firebase";
// import { uuidv4 } from "@firebase/util";

export const ShipmentFB: ShipDB<IoOrder> = {
  approvePickUp: async function (row: IoOrder, expectedReduceCoin: number) {
    isValidOrder(row);
    const { getOrdRef, converterGarment } = getSrc();
    if (!row.shipManagerId) throw new Error("shipManagerId is null");
    const userPay = await IO_PAY_DB.getIoPayByUser(row.shipManagerId);
    if (userPay.budget < expectedReduceCoin)
      throw new Error("보유 금액이 부족합니다.");
    const ordRef = getOrdRef(row.shopId);
    const ordDocRef = doc(ordRef, row.dbId).withConverter(converterGarment);
    return runTransaction(ioFireStore, async (t) => {
      // >>> read order
      const ordDoc = await t.get(ordDocRef);
      if (!ordDoc.exists()) throw new Error("order doc does not exist!");
      const ord = ordDoc.data()!;
      if (ord.items.length < 1)
        throw new Error("request order items not exist");

      const uncleDoc = await t.get(doc(uConverter, ord.shipManagerId));
      const shopDoc = await t.get(doc(uConverter, ord.shopId));
      const uncle = validateUser(uncleDoc.data(), ord.shipManagerId!);
      const shop = validateUser(shopDoc.data(), ord.shopId);
      for (let i = 0; i < ord.items.length; i++) {
        const item = ord.items[i];
        const prod = await VENDOR_GARMENT_DB.getById(
          item.vendorProd.vendorProdId
        );

        if (!prod)
          throw new Error(
            `도매처 상품이 없습니다.: ${item.vendorProd.vendorProdId}`
          );
        const vendorUser = await USER_DB.getUserById(
          ioFireStore,
          item.vendorId,
          true
        );
        const vendor = validateUser(vendorUser, item.vendorId);
        const { shipLocateUncle, pickLocateUncle, clientshipL, clientPickL } =
          checkOrderShipLocate(item, shop, vendor, uncle);
        const shipment = new IoShipment({
          shippingId: uuidv4(),
          orderDbId: ord.dbId,
          orderItemId: item.id,
          shipMethod: "UNCLE",
          additionalInfo: "",
          paid: false,
          shipFeeBasic: shipLocateUncle.amount,
          pickupFeeBasic: pickLocateUncle.amount,
          returnAddress: clientshipL,
          receiveAddress: clientshipL,
          startAddress: clientPickL,
          wishedDeliveryTime: new Date(),
          managerId: uncle.userInfo.userId,
        });
        t.set(
          doc(
            getIoCollection(ioFireStore, {
              c: IoCollection.SHIPMENT,
              uid: uncle.userInfo.userId,
            }),
            shipment.shippingId
          ).withConverter(IoShipment.fireConverter()),
          shipment
        );
        item.shipmentId = shipment.shippingId;
        // setState(ord, item.id, "BEFORE_ASSIGN_PICKUP");
        setState(ord, item.id, "BEFORE_ASSIGN_PICKUP");
      }
      t.update(ordDocRef, converterGarment.toFirestore(ord));
      t.update(
        doc(getIoCollection(ioFireStore, { c: "IO_PAY" }), userPay.userId),
        {
          pendingBudget: userPay.pendingBudget + expectedReduceCoin,
          budget: userPay.budget - expectedReduceCoin,
          history: [
            ...userPay.history,
            {
              createdAt: new Date(),
              userId: userPay.userId,
              amount: -expectedReduceCoin,
              pendingAmount: +expectedReduceCoin,
              state: "APPROVE_PICKUP",
            } as PayHistoryCRT,
          ],
        }
      );

      return ord;
    });
  },
};
const uConverter = getIoCollection(ioFireStore, {
  c: IoCollection.USER,
}).withConverter(userFireConverter);
