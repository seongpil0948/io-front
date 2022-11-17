import { useAuthStore } from "@/store";
import { IoUser, USER_DB } from "@io-boxies/js-lib";

export async function userUpdate(login = true, user: IoUser) {
  const authS = useAuthStore();
  await USER_DB.updateUser(user);
  authS.$patch({ user });
  authS.setUser();

  if (login) authS.login(user);
}

export async function setWorkerId(me: IoUser, userId: string) {
  if (!me.userInfo.workerIds) {
    me.userInfo.workerIds = [userId];
  } else {
    me.userInfo.workerIds.push(userId);
  }
  return USER_DB.updateUser(me);
}
