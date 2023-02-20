import { commonToJson } from "@io-boxies/js-lib";
import {
  loadDate,
  insertById,
  getIoCollection,
  IoCollection,
} from "@io-boxies/js-lib";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { CommonField } from "../common";
import { IO_BANKS, IoPayCRT, PayHistoryCRT } from "./domain";
import { ioFireStore } from "@/plugin/firebase";

export interface IoAccount {
  accountName: string;
  accountNumber: string;
  bank: IO_BANKS;
  code: string;
}
export const emptyAccount = (): IoAccount => ({
  accountName: "",
  accountNumber: "",
  bank: "농협은행",
  code: "011",
});
export class IoPay extends CommonField implements IoPayCRT {
  userId: string;
  budget: number;
  pendingBudget: number;

  constructor(data: IoPayCRT) {
    super(data.createdAt, data.updatedAt);
    this.userId = data.userId;
    this.budget = data.budget;
    this.pendingBudget = data.pendingBudget;
  }
  static initial(userId: string) {
    return new IoPay({
      userId,
      budget: 0,
      pendingBudget: 0,
    });
  }

  static fromJson(data: { [x: string]: any }): IoPay | null {
    data.createdAt = loadDate(data.createdAt);
    data.updatedAt = loadDate(data.updatedAt);
    return data ? new IoPay(data as IoPayCRT) : null;
  }

  async update() {
    await insertById<IoPay>(
      this,
      getIoCollection(ioFireStore, { c: IoCollection.IO_PAY }),
      this.userId,
      true,
      IoPay.fireConverter()
    );
  }
  static fireConverter() {
    return {
      toFirestore: (u: IoPay) => commonToJson(u),
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): IoPay | null => {
        const data = snapshot.data(options);
        return data !== undefined ? IoPay.fromJson(data) : null;
      },
    };
  }
}

export const newPayHistory = (p: Partial<PayHistoryCRT>): PayHistoryCRT => ({
  createdAt: p.createdAt ?? new Date(),
  userId: p.userId!,
  amount: p.amount ?? 0,
  state: p.state!,
  pendingAmount: p.pendingAmount ?? 0,
  tbd: { ...p.tbd },
});
