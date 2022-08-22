// import { GarmentOrder } from "./order";
import {
  CommonField,
  Locate,
  // ProdOrderCombined,
  SHIP_METHOD,
} from "@/composable";
// import {
// FirestoreDataConverter,
// DocumentSnapshot,
// DocumentData,
// } from "@firebase/firestore";
// import { v4 as uuidv4 } from "uuid";

export interface PickupCrt {
  pickupId: string;
  createdAt?: Date;
  updatedAt?: Date;
  shipments: IoShipment[];
  managerId: string; // 엉클관리자 아이디
  shipFee: number;
  shipDiscountPer: number; // 0 ~ 99 %
  uncleIds: string[]; // 엉클근로자 아이디, 토스시 변경가능
}
export class IoPickup extends CommonField implements PickupCrt {
  pickupId: string;
  shipments: IoShipment[];
  managerId: string; // 엉클관리자 아이디
  shipFee: number;
  shipDiscountPer: number; // 0 ~ 99 %
  uncleIds: string[]; // 엉클근로자 아이디, 토스시 변경가능

  constructor(d: PickupCrt) {
    super(d.createdAt, d.updatedAt);
    this.pickupId = d.pickupId;
    this.shipments = d.shipments;
    this.managerId = d.managerId;
    this.shipFee = d.shipFee;
    this.shipDiscountPer = d.shipDiscountPer;
    this.uncleIds = d.uncleIds;
  }
  get pickupAmount() {
    const shipAmount = this.shipments.reduce(
      (acc, curr) => acc + curr.shipAmount,
      0
    );
    return shipAmount + this.shipFee * this.shipDiscountPer;
  }
}

export interface ShipmentCrt {
  createdAt?: Date;
  updatedAt?: Date;
  shippingId: string; // shipment db id
  orderDbId: string; // order db id
  prodOrderId: string; // prod order db id
  trackingNo?: string; //송장번호
  uncleId: string; // 엉클근로자 아이디, 토스시 변경가능
  shipMethod: SHIP_METHOD;
  additionalInfo: string;
  shipFee: number;
  prepaid: boolean;
  paid: boolean;
  pickupFee: number;
  weightUnit: string;
  weight: number;
  sizeUnit: string;
  size: number;
  amountBySize: number;
  amountByWeight: number;
  amountBasic: number;
  returnAddress: Locate; // 출발지
  startAddress: Locate; // 도착지
  receiveAddress: Locate;
  wishedDeliveryTime: Date;
}
export class IoShipment extends CommonField implements ShipmentCrt {
  shippingId: string;
  orderDbId: string;
  uncleId: string; // 엉클근로자 아이디, 토스시 변경가능
  prodOrderId: string;
  trackingNo?: string; //송장번호
  shipMethod: SHIP_METHOD;
  additionalInfo: string;
  shipFee: number;
  pickupFee: number;
  prepaid: boolean;
  paid: boolean;
  weightUnit: string;
  weight: number;
  sizeUnit: string;
  size: number;
  amountBySize: number;
  amountByWeight: number;
  amountBasic: number;
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
    this.shipMethod = d.shipMethod;
    this.additionalInfo = d.additionalInfo;
    this.shipFee = d.shipFee;
    this.prepaid = d.prepaid;
    this.paid = d.paid;
    this.pickupFee = d.pickupFee;
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
  }
  get shipAmount() {
    return (
      this.amountBasic +
      this.size * this.amountBySize +
      this.weight * this.amountByWeight
    );
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
