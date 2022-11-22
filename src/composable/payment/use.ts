import { useAuthStore } from "@/store";
import { onBeforeUnmount } from "vue";
import { IO_PAY_DB } from "./db";

export function useUserPay(userId?: string) {
  const auth = useAuthStore();
  const { userPay, unsubscribe } =
    userId !== null
      ? IO_PAY_DB.getIoPayByUserListen(userId!)
      : IO_PAY_DB.getIoPayByUserListen(auth.currUser.userInfo.userId);

  onBeforeUnmount(() => unsubscribe());
  return { userPay };
}
