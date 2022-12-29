import { COIN_PAY_RATIO, COIN_FEE } from "@/constants";
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

export class IoAccount {
  accountName: string;
  accountNumber: string;
  bank: IO_BANKS;
  constructor(p: {
    accountName: string;
    accountNumber: string;
    bank: IO_BANKS;
  }) {
    this.accountName = p.accountName;
    this.accountNumber = p.accountNumber;
    this.bank = p.bank;
  }

  static empty(): IoAccount {
    return new IoAccount({
      accountName: "",
      accountNumber: "",
      bank: "NH",
    });
  }
}

export class IoPay extends CommonField implements IoPayCRT {
  userId: string;
  budget: number;
  pendingBudget: number;
  history: PayHistoryCRT[];

  constructor(data: IoPayCRT) {
    super(data.createdAt, data.updatedAt);
    this.userId = data.userId;
    this.budget = data.budget;
    this.pendingBudget = data.pendingBudget;
    this.history = data.history;
  }
  static initial(userId: string) {
    return new IoPay({
      userId,
      budget: 0,
      pendingBudget: 0,
      history: [],
    });
  }
  static toMoneyString(coin: number) {
    return IoPay.coinToMoney(coin).toLocaleString() + "원";
  }
  static coinToMoney(coin: number) {
    const money = coin * COIN_PAY_RATIO;
    return money * (1 + COIN_FEE); // tax
  }
  static moneyToCoin(money: number) {
    if (money % COIN_PAY_RATIO !== 0)
      throw new Error(
        `코인으로 변경시 금액은 ${COIN_PAY_RATIO} 으로 나뉘어져야 합니다.`
      );

    return money / COIN_PAY_RATIO;
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
