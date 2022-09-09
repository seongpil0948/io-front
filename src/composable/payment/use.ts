import { useAuthStore } from "@/store";
import { ref, Ref } from "vue";
import { IO_PAY_DB } from "./db";
import { IoPay } from "./model";

export function useUserPay(userId?: string) {
  const auth = useAuthStore();
  const user = auth.currUser;
  const userPay: Ref<IoPay | null> =
    userId !== null
      ? IO_PAY_DB.getIoPayByUserListen(userId!)
      : IO_PAY_DB.getIoPayByUserListen(user.userInfo.userId);

  return { userPay };
}
