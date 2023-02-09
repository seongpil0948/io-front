import { getAmount } from "@/composable";
import { isSamePickLocate, uncleAvailShip } from "@/composable/locate";
import { IoUser, locateToStr } from "@io-boxies/js-lib";
import { IoOrder, OrderItem, OrderItemCombined, PayAmount } from "../domain";

export function isValidOrder(o: IoOrder): void {
  if (o.pendingCnts + o.activeCnts !== o.orderCnts) {
    throw new Error("invalid count");
  } else if (!isValidAmount(o.prodAmount)) {
    throw new Error("invalid amount");
  }
  o.items.forEach((item) => isValidOrderItem(item));
}
export function isValidOrderItem(o: OrderItem | OrderItemCombined): void {
  const counts: { [k: string]: number } = {};
  for (let i = 0; i < o.orderIds.length; i++)
    counts[o.orderIds[i]] = counts[o.orderIds[i]] + 1 || 1;
  if (Object.values(counts).some((cnt) => cnt > 1)) {
    throw new Error("redundant order id ");
  } else if (o.pendingCnt + o.activeCnt !== o.orderCnt) {
    throw new Error("invalid count");
  } else if (!isValidAmount(o.prodAmount)) {
    throw new Error("invalid amount");
  } else if (o.pendingCnt > 0 && o.vendorProd && !o.vendorProd.allowPending) {
    throw new Error("invalid allowPending");
  }
  // else if (!o.orderDbId)
  //   throw new Error(`order item(${o.id}) orderDbId is null`);
}

export function isValidAmount(a: PayAmount) {
  let isValid = true;
  if (a.amount < 0 || a.amount < a.pureAmount) {
    isValid = false;
  } else if (a.amount !== getAmount(a)) {
    isValid = false;
  }

  return isValid;
}

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

export function checkOrderShipLocate(
  item: OrderItem,
  shop: IoUser,
  vendor: IoUser,
  uncle: IoUser
) {
  const isReturn = item.orderType === "RETURN";
  const shopLocate = shop.companyInfo!.shipLocate;
  const vendorLocate = vendor.companyInfo!.shipLocate;
  const shopId = shop.userInfo.userId;
  if (!shopLocate)
    throw new Error(`소매처 대표 배송지 정보가 없습니다. ${shopId}`);
  else if (!vendorLocate)
    throw new Error(`도매처 대표 배송지 정보가 없습니다. ${shopId}`);

  const clientPickL = isReturn ? shopLocate : vendorLocate;
  const clientshipL = isReturn ? vendorLocate : shopLocate;
  const clientshipLStr =
    clientshipL.city ?? "" + clientshipL.county + clientshipL.town;
  const clientPickLStr = locateToStr(clientPickL);
  // clientPickL.city ?? "" + clientPickL.county + clientPickL.town;

  const uncleShips = uncle.uncleInfo!.shipLocates;
  const unclePickups = uncle.uncleInfo!.pickupLocates;
  const shipLocateUncle = isReturn
    ? unclePickups.find((x) => uncleAvailShip(x.locate, clientshipL))!
    : uncleShips.find((x) => uncleAvailShip(x.locate, clientshipL))!;
  const pickLocateUncle = isReturn
    ? uncleShips.find((x) => isSamePickLocate(x.locate, clientPickL))!
    : unclePickups.find((x) => isSamePickLocate(x.locate, clientPickL))!;

  console.log("unclePickups: ", unclePickups);
  console.log("uncleShips: ", uncleShips);
  if (!isReturn && !shipLocateUncle)
    throw new Error(`${clientshipLStr}은 배송불가 지역입니다.`);
  else if (!isReturn && !pickLocateUncle)
    throw new Error(`${clientPickLStr}은 픽업불가 지역입니다.`);

  const result = {
    shipLocateUncle,
    pickLocateUncle,
    clientshipL,
    clientPickL,
  };
  console.log("result of checkOrderShipLocate: ", result);
  return result;
}
