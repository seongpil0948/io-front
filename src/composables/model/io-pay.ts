import {
  loadDate,
  dateToTimeStamp,
  insertById,
  getIoCollection,
} from "@/plugins/firebase";
import { IoCollection } from "@/types";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { CommonField } from ".";
import { COIN_FEE, COIN_PAY_RATIO } from "..";

interface IoPayCRT {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  budget: number;
  pendingBudget: number;
  history: PayHistoryCRT[];
}
export type PAY_HIST_STATE = "CHARGE" | "WITH_DRAW" | "USE";
export const PAY_HIST_STATE: { [key in PAY_HIST_STATE]: string } = {
  CHARGE: "충전",
  WITH_DRAW: "인출",
  USE: "사용",
};

export interface PayHistoryCRT {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  amount: number; // 변동 스푼 량
  state: PAY_HIST_STATE;
  tbd: { [k: string]: any };
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

  static toMoneyString(coin: number) {
    return IoPay.coinToMoney(coin).toLocaleString() + "원";
  }
  static coinToMoney(coin: number) {
    const money = coin * COIN_PAY_RATIO;
    return money * COIN_FEE; // tax
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
      payConverter
    );
  }
}
export const payConverter: FirestoreDataConverter<IoPay | null> = {
  toFirestore: (u: IoPay) => {
    const j = u.toJson();
    j.createdAt = dateToTimeStamp(u.createdAt);
    j.updatedAt = dateToTimeStamp(u.updatedAt);
    return j;
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options: any
  ): IoPay | null => {
    const data = snapshot.data(options);
    console.log(data);
    return data !== undefined ? IoPay.fromJson(data) : null;
  },
};

// export class PayHistory extends CommonField implements PayHistoryCRT {
//   userId: string;
//   amount: number;
//   state: PAY_HIST_STATE;
//   tbd: { [k: string]: any };

//   constructor(data: PayHistoryCRT) {
//     super(data.createdAt, data.updatedAt);
//     this.userId = data.userId;
//     this.amount = data.amount;
//     this.state = data.state;
//     this.tbd = data.tbd;
//   }
// }
