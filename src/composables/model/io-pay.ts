import { CommonField } from "..";

type PAY_STATE = "NORMAL" | "WITH_DRAW" | "DEPOSIT" | "WAIT";
const PAY_STATE: { [key in PAY_STATE]: PAY_STATE } = {
  NORMAL: "NORMAL",
  WITH_DRAW: "NORMAL",
  DEPOSIT: "NORMAL",
  WAIT: "NORMAL",
};
interface IoPayCRT {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  budget: number;
  state: PAY_STATE;
}
class IoPay extends CommonField implements IoPayCRT {
  userId: string;
  budget: number;
  state: PAY_STATE;
  constructor(data: IoPayCRT) {
    super(data.createdAt, data.updatedAt);
    this.userId = data.userId;
    this.budget = data.budget;
    this.state = data.state;
  }
}

export { IoPay };
