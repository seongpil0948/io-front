type IO_BANKS = "NH" | "SHINHAN" | "HANA" | "CITY" | "SC_JAIL" | "KB_STAR";
const IO_BANKS: { [key in IO_BANKS]: IO_BANKS } = Object.freeze({
  NH: "NH",
  SHINHAN: "SHINHAN",
  HANA: "HANA",
  CITY: "CITY",
  SC_JAIL: "SC_JAIL",
  KB_STAR: "KB_STAR",
});

interface AccountCRT {
  userId: string;
  accountNumber: string;
  bank: IO_BANKS;
}

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
