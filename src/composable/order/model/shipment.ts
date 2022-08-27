import { CommonField } from "@/composable/common";
// import { GarmentOrder } from "./order";
import { Locate, ShipmentCrt, SHIP_METHOD } from "@/composable";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";

// export interface PickupCrt {
//   pickupId: string;
//   createdAt?: Date;
//   updatedAt?: Date;
//   shipments: IoShipment[];
//   managerId: string; // 엉클관리자 아이디
//   pickupFee: number;
//   pickDiscountPer: number; // 0 ~ 99 %
//   uncleIds: string[]; // 엉클근로자 아이디, 토스시 변경가능
// }
// export class IoPickup extends CommonField implements PickupCrt {
//   pickupId: string;
//   shipments: IoShipment[];
//   managerId: string; // 엉클관리자 아이디
//   pickupFee: number; // 지역별 픽업 비용
//   pickDiscountPer: number; // 0 ~ 99 % 프로모션 적용퍼센트
//   uncleIds: string[]; // 엉클근로자 아이디, 토스시 변경가능

//   constructor(d: PickupCrt) {
//     super(d.createdAt, d.updatedAt);
//     this.pickupId = d.pickupId;
//     this.shipments = d.shipments;
//     this.managerId = d.managerId;
//     this.pickupFee = d.pickupFee;
//     this.pickDiscountPer = d.pickDiscountPer;
//     this.uncleIds = d.uncleIds;
//   }
//   static fromJson(d: { [x: string]: any }): IoPickup {
//     return new IoPickup({
//       pickupId: d.pickupId,
//       shipments: d.shipments,
//       managerId: d.managerId,
//       pickupFee: d.pickupFee,
//       pickDiscountPer: d.pickDiscountPer,
//       uncleIds: d.uncleIds,
//     });
//   }
//   get pickupAmount() {
//     const shipAmount = this.shipments.reduce(
//       (acc, curr) => acc + curr.shipAmount,
//       0
//     );
//     return shipAmount + this.pickupFee * this.pickDiscountPer;
//   }
// }

export class IoShipment extends CommonField implements ShipmentCrt {
  shippingId: string;
  orderDbId: string;
  uncleId?: string; // 엉클근로자 아이디, 토스시 변경가능
  prodOrderId: string;
  trackingNo?: string; //송장번호
  shipMethod: SHIP_METHOD;
  additionalInfo: string;
  paid: boolean;
  weightUnit?: string;
  weight?: number;
  sizeUnit?: string;
  size?: number;
  amountBySize?: number;
  amountByWeight?: number;
  amountBasic: number;
  returnAddress: Locate;
  startAddress: Locate;
  receiveAddress: Locate;
  wishedDeliveryTime: Date;
  managerId: string; // 엉클관리자 아이디
  constructor(d: ShipmentCrt) {
    super(d.createdAt, d.updatedAt);
    this.shippingId = d.shippingId;
    this.orderDbId = d.orderDbId;
    this.prodOrderId = d.prodOrderId;
    this.uncleId = d.uncleId;
    this.trackingNo = d.trackingNo;
    this.shipMethod = d.shipMethod;
    this.additionalInfo = d.additionalInfo;
    this.paid = d.paid;
    this.weightUnit = d.weightUnit;
    this.weight = d.weight;
    this.sizeUnit = d.sizeUnit;
    this.size = d.size;
    this.amountBySize = d.amountBySize;
    this.amountByWeight = d.amountByWeight;
    this.amountBasic = d.amountBasic;
    this.returnAddress = d.returnAddress;
    this.startAddress = d.startAddress;
    this.receiveAddress = d.receiveAddress;
    this.wishedDeliveryTime = d.wishedDeliveryTime;
    this.managerId = d.managerId;
  }
  get shipAmount() {
    if (this.size && this.amountBySize && this.amountByWeight && this.weight)
      return (
        this.amountBasic +
        this.size * this.amountBySize +
        this.weight * this.amountByWeight
      );
    else return -1;
  }

  static fromJson(d: { [x: string]: any }): IoShipment {
    return new IoShipment({
      shippingId: d.shippingId,
      orderDbId: d.orderDbId,
      uncleId: d.uncleId,
      prodOrderId: d.prodOrderId,
      trackingNo: d.trackingNo,
      shipMethod: d.shipMethod,
      additionalInfo: d.additionalInfo,
      paid: d.paid,
      weightUnit: d.weightUnit,
      weight: d.weight,
      sizeUnit: d.sizeUnit,
      size: d.size,
      amountBySize: d.amountBySize,
      amountByWeight: d.amountByWeight,
      amountBasic: d.amountBasic,
      returnAddress: d.returnAddress,
      startAddress: d.startAddress,
      receiveAddress: d.receiveAddress,
      wishedDeliveryTime: d.wishedDeliveryTime,
      managerId: d.managerId,
    });
  }
  static fireConverter(): FirestoreDataConverter<IoShipment> {
    return {
      toFirestore: (m: IoShipment) => {
        m.updatedAt = new Date();
        return m instanceof CommonField
          ? m.toJson()
          : IoShipment.fromJson(m)!.toJson();
      },
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): IoShipment => {
        const data = snapshot.data(options);
        return IoShipment.fromJson(data!)!;
      },
    };
  }
}
