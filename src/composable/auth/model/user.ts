import { useAuthStore } from "@/store";
import { IoUser, USER_DB } from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";

export async function userUpdate(user: IoUser, login = true) {
  const authS = useAuthStore();
  await USER_DB.updateUser(ioFireStore, user);
  authS.setUser(user);

  if (login) authS.login(user);
}

export async function setWorkerId(me: IoUser, userId: string) {
  if (!me.userInfo.workerIds) {
    me.userInfo.workerIds = [userId];
  } else {
    me.userInfo.workerIds.push(userId);
  }
  return USER_DB.updateUser(ioFireStore, me);
}
