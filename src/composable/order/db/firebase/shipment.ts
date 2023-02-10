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
  newPayHistory,
  defrayAmount,
  refreshOrder,
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
    const { getOrdRef, orderFireConverter, getPayDocRef, getPayHistDocRef } =
      getSrc();
    if (!row.shipManagerId) throw new Error("shipManagerId is null");
    const unclePay = await IO_PAY_DB.getIoPayByUser(row.shipManagerId);
    const shopPay = await IO_PAY_DB.getIoPayByUser(row.shopId);
    if (unclePay.budget < expectedReduceCoin)
      throw new Error("보유 금액이 부족합니다.");
    const ordRef = getOrdRef(row.shopId);
    const ordDocRef = doc(ordRef, row.dbId).withConverter(orderFireConverter);
    return runTransaction(ioFireStore, async (t) => {
      // >>> read order
      const ordDoc = await t.get(ordDocRef);
      if (!ordDoc.exists()) throw new Error("order doc does not exist!");
      const ord = ordDoc.data();
      if (ord.items.length < 1)
        throw new Error("request order items not exist");
      else if (ord.shopId !== row.shopId)
        throw new Error(
          `input shopId(${row.shopId}) not equal to order shopId(${ord.shopId})`
        );

      const uncleDoc = await t.get(doc(uConverter, ord.shipManagerId));
      const shopDoc = await t.get(doc(uConverter, ord.shopId));
      const uncle = validateUser(uncleDoc.data(), ord.shipManagerId!);
      const shop = validateUser(shopDoc.data(), ord.shopId);
      const shipPendingAmount = ord.shipAmount.pendingAmount;
      let price = ord.pickAmount.pendingAmount + (shipPendingAmount ?? 0);
      if (ord.isDirectToShip) {
        // 대납가격이 포함되어 있기 때문에
        price -= ord.prodAmount.amount;
        ord.items.forEach((item) => {
          const { newAmount } = defrayAmount(
            item.prodAmount,
            { paidAmount: item.prodAmount.amount },
            false
          );
          item.prodAmount = newAmount;
        });

        if (price < 0) throw new Error("invalid process amount");
      }
      if (!uncle.uncleInfo) throw new Error("엉클정보가 없습니다.");
      else if (shopPay.pendingBudget < price)
        throw new Error(
          `유저 보류캐쉬(${shopPay.pendingBudget})가 필요캐쉬(${price}) 보다 작습니다.`
        );
      const { newAmount } = defrayAmount(
        ord.pickAmount,
        { paidAmount: ord.pickAmount.amount },
        false
      );
      ord.pickAmount = newAmount;
      console.log(
        "before shop/uncle Pay: ",
        JSON.parse(JSON.stringify(shopPay)),
        JSON.parse(JSON.stringify(unclePay))
      );
      shopPay.pendingBudget -= price;
      unclePay.pendingBudget += price;

      t.set(
        getPayHistDocRef(shopPay.userId),
        newPayHistory({
          pendingAmount: -price,
          userId: shopPay.userId,
          state: "APPROVE_PICKUP",
        })
      );
      t.set(
        getPayHistDocRef(unclePay.userId),
        newPayHistory({
          userId: unclePay.userId,
          pendingAmount: price,
          state: "APPROVE_PICKUP",
        })
      );

      t.update(getPayDocRef(shopPay.userId), {
        budget: shopPay.budget,
        pendingBudget: shopPay.pendingBudget,
        updatedAt: new Date(),
      });
      t.update(getPayDocRef(unclePay.userId), {
        pendingBudget: unclePay.pendingBudget,
        updatedAt: new Date(),
      });
      console.log("after shop/uncle Pay: ", shopPay, unclePay);
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
      refreshOrder(ord);
      t.set(ordDocRef, ord);
      t.update(
        doc(getIoCollection(ioFireStore, { c: "IO_PAY" }), unclePay.userId),
        {
          pendingBudget: unclePay.pendingBudget + expectedReduceCoin,
          budget: unclePay.budget - expectedReduceCoin,
        }
      );
      t.set(
        getPayHistDocRef(unclePay.userId),
        newPayHistory({
          createdAt: new Date(),
          userId: unclePay.userId,
          amount: -expectedReduceCoin,
          pendingAmount: +expectedReduceCoin,
          state: "APPROVE_PICKUP_FEE",
        })
      );

      return ord;
    });
  },
};
const uConverter = getIoCollection(ioFireStore, {
  c: IoCollection.USER,
}).withConverter(userFireConverter);
