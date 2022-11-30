import {
  IoShipment,
  IoOrder,
  IO_PAY_DB,
  ShipDB,
  isValidOrder,
  setState,
  uncleAvailShip,
} from "@/composable";
import { getIoCollection, IoCollection } from "@io-boxies/js-lib";
import { useVendorsStore } from "@/store";
import { uuidv4 } from "@firebase/util";
import { IoUser, userFireConverter } from "@io-boxies/js-lib";
import { doc, runTransaction } from "firebase/firestore";
import { getSrc } from "./order";
import { ioFire } from "@/plugin/firebase";
// import { uuidv4 } from "@firebase/util";
export const ShipmentFB: ShipDB<IoOrder> = {
  approvePickUp: async function (row: IoOrder, expectedReduceCoin: number) {
    isValidOrder(row);
    const vendorStore = useVendorsStore();
    const { getOrdRef, converterGarment } = getSrc();
    if (!row.shipManagerId) throw new Error("shipManagerId is null");
    const userPay = await IO_PAY_DB.getIoPayByUser(row.shipManagerId);
    if (userPay.budget < expectedReduceCoin)
      throw new Error("보유 코인이 부족합니다.");
    const ordRef = getOrdRef(row.shopId);
    const ordDocRef = doc(ordRef, row.dbId).withConverter(converterGarment);
    return runTransaction(ioFire.store, async (transaction) => {
      const ordDoc = await transaction.get(ordDocRef);
      if (!ordDoc.exists()) throw new Error("order doc does not exist!");

      const ord = ordDoc.data()!;
      if (ord.items.length < 1)
        throw new Error("request order items not exist");

      const uncleDoc = await transaction.get(
        doc(
          getIoCollection({ c: IoCollection.USER }).withConverter(
            userFireConverter
          ),
          ord.shipManagerId
        )
      );
      const shopDoc = await transaction.get(
        doc(
          getIoCollection({ c: IoCollection.USER }).withConverter(
            userFireConverter
          ),
          ord.shopId
        )
      );

      const uncle = validateUser(uncleDoc.data(), ord.shipManagerId!);
      const shop = validateUser(shopDoc.data(), ord.shopId);

      for (let i = 0; i < ord.items.length; i++) {
        const item = ord.items[i];
        const prod = vendorStore.vendorProds.find(
          (g) => g.vendorProdId === item.vendorProd.vendorProdId
        );
        // const vendorDoc = await transaction.get(
        //   doc(
        //     getIoCollection({ c: IoCollection.USER }).withConverter(
        //       IoUser.fireConverter()
        //     ),
        //     item.vendorId
        //   )
        // );
        if (!prod)
          throw new Error(
            `도매처 상품이 없습니다.: ${item.vendorProd.vendorProdId}`
          );
        const vendor = validateUser(
          vendorStore.vendorById[item.vendorId],
          item.vendorId
        );
        const isReturn = item.orderType === "RETURN";
        const shopLocate = shop.companyInfo!.shipLocate;
        const vendorLocate = vendor.companyInfo!.shipLocate;
        if (!shopLocate) {
          return new Error(
            `소매처 대표 배송지 정보가 없습니다. ${shop.userInfo.userId}`
          );
        } else if (!vendorLocate) {
          return new Error(
            `도매처 대표 배송지 정보가 없습니다. ${shop.userInfo.userId}`
          );
        }
        const clientPickL = isReturn ? shopLocate : vendorLocate;
        const clientshipL = isReturn ? vendorLocate : shopLocate;
        const clientshipLStr =
          clientshipL.city ?? "" + clientshipL.county + clientshipL.town;
        const clientPickLStr =
          clientPickL.city ?? "" + clientPickL.county + clientPickL.town;

        const uncleShips = uncle.uncleInfo!.shipLocates;
        const unclePickups = uncle.uncleInfo!.pickupLocates;
        const shipLocateUncle = isReturn
          ? unclePickups.find((x) => uncleAvailShip(x.locate, clientshipL))!
          : uncleShips.find((x) => uncleAvailShip(x.locate, clientshipL))!;
        const pickLocateUncle = isReturn
          ? uncleShips.find((x) => uncleAvailShip(x.locate, clientPickL))!
          : unclePickups.find((x) => uncleAvailShip(x.locate, clientPickL))!;

        if (!isReturn && !shipLocateUncle)
          throw new Error(`${clientshipLStr}은 배송불가 지역입니다.`);
        else if (!isReturn && !pickLocateUncle)
          throw new Error(`${clientPickLStr}은 픽업불가 지역입니다.`);
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
        transaction.set(
          doc(
            getIoCollection({
              c: IoCollection.SHIPMENT,
              uid: uncle.userInfo.userId,
            }),
            shipment.shippingId
          ).withConverter(IoShipment.fireConverter()),
          shipment
        );
        item.shipmentId = shipment.shippingId;
        setState(ord, item.id, "BEFORE_ASSIGN_PICKUP");
      }
      transaction.update(ordDocRef, converterGarment.toFirestore(ord));
      transaction.update(
        doc(getIoCollection({ c: IoCollection.IO_PAY }), userPay.userId),
        {
          pendingBudget: userPay.pendingBudget + expectedReduceCoin,
          budget: userPay.budget - expectedReduceCoin,
        }
      );
      return ord;
    });
  },
};

export function validateUser(
  u: IoUser | null | undefined,
  userId: string
): IoUser {
  if (!u) throw new Error(`유저정보가 없습니다. id: ${userId}`);
  const role = u.userInfo.role;
  const name =
    role === "SHOP"
      ? "소매처"
      : role === "VENDOR"
      ? "도매처"
      : role === "UNCLE"
      ? "배송처"
      : "유저";
  if (!u.companyInfo) throw new Error(`${name}의 회사정보가 없습니다.`);
  else if ((role === "SHOP" || role === "VENDOR") && !u.companyInfo.shipLocate)
    throw new Error(`${name}의 대표 배송지 설정을 해주세요.`);
  else if (role === "UNCLE" && !u.uncleInfo)
    throw new Error("엉클 배송지와 요금 설정을 해주세요");
  return u!;
}
