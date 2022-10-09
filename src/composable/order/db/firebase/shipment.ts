import {
  IoShipment,
  GarmentOrder,
  IO_PAY_DB,
  ShipDB,
  IoUser,
} from "@/composable";
import { iostore } from "@/plugin/firebase";
import { useVendorsStore } from "@/store";
import { getIoCollection, IoCollection } from "@/util";
import { uuidv4 } from "@firebase/util";
import { doc, runTransaction } from "firebase/firestore";
import { getSrc } from "./order";
// import { v4 as uuidv4 } from "uuid";
export const ShipmentFB: ShipDB<GarmentOrder> = {
  approvePickUp: async function (
    row: GarmentOrder,
    expectedReduceCoin: number
  ) {
    const vendorStore = useVendorsStore();
    const { getOrdRef, converterGarment } = getSrc();
    if (!row.shipManagerId) throw new Error("shipManagerId is null");
    const userPay = await IO_PAY_DB.getIoPayByUser(row.shipManagerId);
    if (userPay.availBudget < expectedReduceCoin)
      throw new Error("보유 코인이 부족합니다.");
    else if (!row.isValid) throw new Error("invalid order.");

    const ordRef = getOrdRef(row.shopId);
    const ordDocRef = doc(ordRef, row.dbId).withConverter(converterGarment);
    return runTransaction(iostore, async (transaction) => {
      const ordDoc = await transaction.get(ordDocRef);
      if (!ordDoc.exists()) throw new Error("order doc does not exist!");

      const ord = ordDoc.data()!;
      if (ord.items.length < 1)
        throw new Error("request order items not exist");

      const uncleDoc = await transaction.get(
        doc(
          getIoCollection({ c: IoCollection.USER }).withConverter(
            IoUser.fireConverter()
          ),
          ord.shipManagerId
        )
      );
      const shopDoc = await transaction.get(
        doc(
          getIoCollection({ c: IoCollection.USER }).withConverter(
            IoUser.fireConverter()
          ),
          ord.shopId
        )
      );

      const uncle = validateUser(uncleDoc.data(), ord.shipManagerId!);
      const shop = validateUser(shopDoc.data(), ord.shopId);

      for (let i = 0; i < ord.items.length; i++) {
        const item = ord.items[i];
        const prod = vendorStore.vendorGarments.find(
          (g) => g.vendorProdId === item.vendorProdId
        );
        const vendorDoc = await transaction.get(
          doc(
            getIoCollection({ c: IoCollection.USER }).withConverter(
              IoUser.fireConverter()
            ),
            item.vendorId
          )
        );
        if (!prod)
          throw new Error(`도매처 상품이 없습니다.: ${item.vendorProdId}`);
        const vendor = validateUser(vendorDoc.data(), item.vendorId);
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
        const pickLocate = isReturn ? shopLocate : vendorLocate;
        const shipLocate = isReturn ? vendorLocate : shopLocate;
        const shipLocateStr = isReturn
          ? vendorLocate.detailLocate
          : shopLocate.detailLocate;
        const ship = uncle.uncleInfo!.shipLocates;
        const pick = uncle.uncleInfo!.pickupLocates;
        const shipLocateUncle = isReturn
          ? pick.find((x) => x.locate.code === shipLocate.code)!
          : ship.find((x) => x.locate.code === shipLocate.code)!;
        const pickLocateUncle = isReturn
          ? ship.find((x) => x.locate.code === pickLocate.code)!
          : pick.find((x) => x.locate.code === pickLocate.code)!;

        if (!isReturn && !shipLocateUncle)
          throw new Error(`${shipLocateStr}은 배송불가 지역입니다.`);
        else if (!isReturn && !pickLocateUncle)
          throw new Error(`${pickLocate.detailLocate}은 픽업불가 지역입니다.`);
        const shipment = new IoShipment({
          shippingId: uuidv4(),
          orderDbId: ord.dbId,
          prodOrderId: item.id,
          shipMethod: "UNCLE",
          additionalInfo: "",
          paid: false,
          shipFeeBasic: shipLocateUncle.amount,
          pickupFeeBasic: pickLocateUncle.amount,
          returnAddress: shipLocate,
          receiveAddress: shipLocate,
          startAddress: pickLocate,
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
        ord.setState(item.id, "BEFORE_ASSIGN_PICKUP");
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

function validateUser(u: IoUser | null | undefined, userId: string): IoUser {
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
    throw new Error("배송지 정보를 입력해주세요.");
  else if (role === "UNCLE" && !u.uncleInfo)
    throw new Error("배송처 정보를 입력해주세요");
  return u!;
}
