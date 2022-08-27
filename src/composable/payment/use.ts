import { useAuthStore } from "@/store";
import { ref, watchEffect } from "vue";
import { IO_PAY_DB } from "./db";
import { IoPay } from "./model";

export function useUserPay() {
  const auth = useAuthStore();
  const user = auth.currUser;
  let userPay = ref<IoPay | null>(null);
  watchEffect(() => {
    if (!user) {
      userPay.value = null;
      return;
    } else if (userPay.value) {
      if (user.userInfo.userId !== userPay.value.userId) {
        userPay = IO_PAY_DB.getIoPayByUserListen(user.userInfo.userId);
      } else {
        return;
      }
    } else {
      userPay = IO_PAY_DB.getIoPayByUserListen(user.userInfo.userId);
    }
  });

  return { userPay };
}
