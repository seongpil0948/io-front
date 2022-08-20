// import { GarmentOrder } from "./order";
import {
  CommonField,
  Locate,
  // ProdOrderCombined,
  SHIP_METHOD,
  SHIP_STATE,
} from "@/composable";
// import {
// FirestoreDataConverter,
// DocumentSnapshot,
// DocumentData,
// } from "@firebase/firestore";
// import { v4 as uuidv4 } from "uuid";

export interface PickupCrt {
  pickupId: string;
  shipmentIds: string[];
  managerId: string; // 엉클관리자 아이디
  shipFee: number;
  uncleIds: string[]; // 엉클근로자 아이디, 토스시 변경가능
}
export interface ShipmentCrt {
  createdAt?: Date;
  updatedAt?: Date;
  shippingId: string;
  orderDbId: string;
  prodOrderId: string;
  trackingNo?: string; //송장번호
  uncleId: string; // 엉클근로자 아이디, 토스시 변경가능
  trackingNoUpdatedAt?: Date;
  shipMethod: SHIP_METHOD;
  status: SHIP_STATE;
  additionalInfo: string;
  shipFee: number;
  prepaid: boolean;
  paid: boolean;
  pickupFee: number;
  weightG?: number; // TODO: 중량  상품 에 추가가 되든, 부피 항목이 추가되든 할 수 있음
  returnAddress: Locate;
  startAddress: Locate;
  receiveAddress: Locate;
  wishedDeliveryTime: Date;
}
export class IoShipment extends CommonField implements ShipmentCrt {
  shippingId: string;
  orderDbId: string;
  uncleId: string; // 엉클근로자 아이디, 토스시 변경가능
  prodOrderId: string;
  trackingNo?: string; //송장번호
  trackingNoUpdatedAt?: Date;
  shipMethod: SHIP_METHOD;
  status: SHIP_STATE;
  additionalInfo: string;
  shipFee: number;
  pickupFee: number;
  prepaid: boolean;
  paid: boolean;
  weightG?: number;
  returnAddress: Locate;
  startAddress: Locate;
  receiveAddress: Locate;
  wishedDeliveryTime: Date;
  constructor(d: ShipmentCrt) {
    super(d.createdAt, d.updatedAt);
    this.shippingId = d.shippingId;
    this.orderDbId = d.orderDbId;
    this.prodOrderId = d.prodOrderId;
    this.uncleId = d.uncleId;
    this.trackingNo = d.trackingNo;
    this.trackingNoUpdatedAt = d.trackingNoUpdatedAt;
    this.shipMethod = d.shipMethod;
    this.status = d.status;
    this.additionalInfo = d.additionalInfo;
    this.shipFee = d.shipFee;
    this.prepaid = d.prepaid;
    this.paid = d.paid;
    this.pickupFee = d.pickupFee;
    this.weightG = d.weightG;
    this.returnAddress = d.returnAddress;
    this.startAddress = d.startAddress;
    this.receiveAddress = d.receiveAddress;
    this.wishedDeliveryTime = d.wishedDeliveryTime;
  }
  // static fromGarmentOrder(
  //   d: ProdOrderCombined,
  //   orderDbId: string,
  //   shipMethod: SHIP_METHOD,
  //   shipFee: number,
  //   returnAddress: Locate,
  //   startAddress: Locate,
  //   receiveAddress: Locate,
  //   wishedDeliveryTime: Date
  // ) {
  //   return new IoShipment({
  //     shippingId: uuidv4(),
  //     orderDbId,
  //     prodOrderId: d.id,
  //     shipMethod,
  //     status: SHIP_STATE.BEFORE_READY,
  //     additionalInfo: "",
  //     shipFee,
  //     prepaid: false,
  //     paid: false,
  //     returnAddress,
  //     startAddress,
  //     receiveAddress,
  //     wishedDeliveryTime,
  //   });
  // }

  // static fromJson(d: { [x: string]: any }): IoShipment {
  //   return new IoShipment({
  //     createdAt: d.createdAt,
  //     updatedAt: d.updatedAt,
  //     shippingId: d.shippingId,
  //     orderDbId: d.orderDbId,
  //     prodOrderId: d.prodOrderId,
  //     trackingNo: d.trackingNo,
  //     trackingNoUpdatedAt: d.trackingNoUpdatedAt,
  //     shipMethod: d.shipMethod,
  //     status: d.status,
  //     additionalInfo: d.additionalInfo,
  //     shipFee: d.shipFee,
  //     prepaid: d.prepaid,
  //     paid: d.paid,
  //     weightG: d.weightG,
  //     returnAddress: d.returnAddress,
  //     startAddress: d.startAddress,
  //     receiveAddress: d.receiveAddress,
  //     wishedDeliveryTime: d.wishedDeliveryTime,
  //   });
  // }
  // static fireConverter(): FirestoreDataConverter<IoShipment> {
  //   return {
  //     toFirestore: (m: IoShipment) => {
  //       m.updatedAt = new Date();
  //       return m instanceof CommonField
  //         ? m.toJson()
  //         : IoShipment.fromJson(m)!.toJson();
  //     },
  //     fromFirestore: (
  //       snapshot: DocumentSnapshot<DocumentData>,
  //       options: any
  //     ): IoShipment => {
  //       const data = snapshot.data(options);
  //       return IoShipment.fromJson(data!)!;
  //     },
  //   };
  // }
}
