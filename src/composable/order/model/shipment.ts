import { CommonField } from "@/composable/common";
// import { IoOrder } from "./order";
import {
  SHIP_METHOD,
  Locate,
  insertById,
  getIoCollection,
  IoCollection,
} from "@io-boxies/js-lib";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { commonToJson } from "@/util";

export class IoShipment extends CommonField {
  shippingId: string;
  orderDbId: string;
  uncleId?: string; // 엉클근로자 아이디, 토스시 변경가능
  orderItemId: string;
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
  shipFeeBasic: number;
  pickupFeeBasic: number;
  returnAddress: Locate;
  startAddress: Locate;
  receiveAddress: Locate;
  wishedDeliveryTime: Date;
  managerId: string; // 엉클관리자 아이디
  constructor(d: {
    [k in keyof Omit<
      IoShipment,
      | "pickAmount"
      | "shipAmount"
      | "update"
      | "fromJson"
      | "fireConverter"
      | "toJson"
    >]: IoShipment[k];
  }) {
    super(d.createdAt, d.updatedAt);
    this.shippingId = d.shippingId;
    this.orderDbId = d.orderDbId;
    this.orderItemId = d.orderItemId;
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
    this.shipFeeBasic = d.shipFeeBasic;
    this.pickupFeeBasic = d.pickupFeeBasic;
    this.returnAddress = d.returnAddress;
    this.startAddress = d.startAddress;
    this.receiveAddress = d.receiveAddress;
    this.wishedDeliveryTime = d.wishedDeliveryTime;
    this.managerId = d.managerId;
  }
  get pickAmount() {
    if (
      !this.size ||
      !this.amountBySize ||
      !this.amountByWeight ||
      !this.weight
    )
      throw new Error("배송 제원 미입력 에러");

    return (
      this.pickupFeeBasic +
      this.size * this.amountBySize +
      this.weight * this.amountByWeight
    );
  }

  get shipAmount() {
    return this.pickAmount + this.shipFeeBasic;
  }

  async update() {
    return insertById<IoShipment>(
      this,
      getIoCollection({ c: IoCollection.SHIPMENT, uid: this.managerId }),
      this.shippingId,
      true,
      IoShipment.fireConverter()
    );
  }

  static fromJson(
    d: { [k in keyof IoShipment]: IoShipment[k] } | DocumentData
  ): IoShipment {
    return new IoShipment({
      shippingId: d.shippingId,
      orderDbId: d.orderDbId,
      uncleId: d.uncleId,
      orderItemId: d.orderItemId,
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
      shipFeeBasic: d.shipFeeBasic,
      pickupFeeBasic: d.pickupFeeBasic,
      returnAddress: d.returnAddress,
      startAddress: d.startAddress,
      receiveAddress: d.receiveAddress,
      wishedDeliveryTime: d.wishedDeliveryTime,
      managerId: d.managerId,
    });
  }

  static fireConverter(): FirestoreDataConverter<IoShipment> {
    return {
      toFirestore: (m: IoShipment) => commonToJson(m),
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
