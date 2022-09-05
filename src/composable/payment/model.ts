import { COIN_PAY_RATIO, COIN_FEE } from "@/constants";
import { loadDate, insertById, getIoCollection, IoCollection } from "@/util";
import { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { CommonField } from "../common";
import { IO_BANKS, IoPayCRT, PayHistoryCRT } from "./domain";

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

  get availBudget() {
    return this.budget - this.pendingBudget;
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
    data.createdAt = loadDate(data.createdAt ?? new Date());
    data.updatedAt = loadDate(data.updatedAt ?? new Date());
    return data ? new IoPay(data as IoPayCRT) : null;
  }

  async update() {
    await insertById<IoPay>(
      this,
      getIoCollection({ c: IoCollection.IO_PAY }),
      this.userId,
      true,
      IoPay.fireConverter()
    );
  }
  static fireConverter() {
    return {
      toFirestore: (u: IoPay) => {
        u.updatedAt = new Date();
        return u instanceof CommonField
          ? u.toJson()
          : IoPay.fromJson(u)!.toJson();
      },
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
