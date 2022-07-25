import { IO_BANKS, AccountCRT } from "./domain";

export class IoAccount {
  userId: string;
  accountNumber: string;
  bank: IO_BANKS;
  constructor(p: AccountCRT) {
    this.userId = p.userId;
    this.accountNumber = p.accountNumber;
    this.bank = p.bank;
  }
}
