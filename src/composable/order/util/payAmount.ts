import { PayAmount, PAY_METHOD } from "@/composable";
import cloneDeep from "lodash.clonedeep";

export const newPayAmount = (p: Partial<PayAmount>): PayAmount => ({
  tax: p.tax ?? 0,
  paidAmount: p.paidAmount ?? 0,
  paid: p.paid ?? "NO",
  pureAmount: p.pureAmount ?? 0,
  amount: p.amount ?? 0,
  paymentConfirm: p.paymentConfirm ?? false,
  paymentMethod: p.paymentMethod ?? "CASH",
  paidAt: p.paidAt ?? undefined,
  discountAmount: p.discountAmount ?? 0,
  isPending: p.isPending ?? false,
  pendingAmount: p.pendingAmount ?? 0,
});

export const getPureAmount = (orderCnt: number, prodPrice: number) =>
  orderCnt * prodPrice;

export const getAmount = (a: { pureAmount: number; tax: number }) =>
  a.pureAmount + a.tax;

export interface DefrayParam {
  paidAmount: number;
  tax: number;
  payMethod: PAY_METHOD;
}
export function defrayAmount(
  target: PayAmount,
  d: Partial<DefrayParam>,
  isPending = false
) {
  // pure amount 는 채워져 있어야 한다.
  const t = cloneDeep(target);
  t.tax = d.tax ?? 0;
  t.amount = getAmount(t);
  if (isPending) {
    t.pendingAmount = d.paidAmount ?? t.amount;
    t.isPending = true;
  } else {
    t.paidAmount = d.paidAmount ?? t.amount;
    if (t.pendingAmount > 0 || t.isPending) {
      t.pendingAmount -= t.paidAmount;
      t.isPending = t.pendingAmount > 0;
    }
  }
  t.paidAt = new Date();
  t.paymentConfirm = true;
  t.paymentMethod = d.payMethod ?? "CASH";
  const creditAmount = t.amount - t.paidAmount;
  refreshAmount(t);
  return { newAmount: t, creditAmount };
}

export const mergeAmount = (origin: PayAmount, y: PayAmount): PayAmount => ({
  tax: y.tax + origin.tax,
  paidAmount: y.paidAmount + origin.paidAmount,
  paid: y.paid,
  paidAt: y.paidAt ?? origin.paidAt,
  pureAmount: y.pureAmount + origin.pureAmount,
  amount: y.amount + origin.amount,
  paymentConfirm: origin.paymentConfirm === true && y.paymentConfirm === true,
  paymentMethod: y.paymentMethod,
  discountAmount: y.discountAmount + origin.discountAmount,
  pendingAmount: y.pendingAmount + origin.pendingAmount,
  isPending: origin.isPending === false && y.isPending === false,
});

export function refreshAmount(t: PayAmount) {
  if (t.amount === t.paidAmount) {
    t.paid = "EXACT";
  } else if (t.amount > t.paidAmount) {
    t.paid = "CREDIT";
  } else if (t.amount < t.paidAmount) {
    t.paid = "OVERCOME";
  }
}
