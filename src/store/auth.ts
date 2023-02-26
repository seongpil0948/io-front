import { defineStore } from "pinia";
import { getAuth, signOut } from "firebase/auth";
import { IoUser, userFromJson, USER_DB, USER_ROLE } from "@/composable";
import { getActivePinia } from "pinia";
import { ioFire, ioFireStore } from "@/plugin/firebase";
import router from "@/plugin/router";
import { getAnalytics, setUserId } from "@firebase/analytics";
import { computed, ref, shallowRef, watchEffect } from "vue";

const userKey = "user";
export const useAuthStore = defineStore("auth", () => {
  const user = ref<IoUser | null>(null);
  const contractUncles = shallowRef<IoUser[]>([]);

  watchEffect(async () => {
    console.log("watch auth store user: ", user.value);
    if (!user.value || !user.value?.shopInfo) return;
    const ids = user.value?.shopInfo?.uncleUserIds;
    console.log("watch uncleUserIds: ", ids);
    if (!ids) return;
    contractUncles.value = await USER_DB.getUserByIds(ioFireStore, ids);
  });

  const currUser = (): IoUser => {
    if (user.value) return user.value;
    else {
      const userStr = localStorage.getItem(userKey);
      if (userStr) {
        const u = userFromJson(JSON.parse(userStr));
        console.log("get user from localStorage", u);
        if (!u) {
          router.replace({ name: "Login" });
        }
        user.value = u!;
      } else {
        router.replace({ name: "Login" });
      }
    }
    if (
      !(["SHOP", "VENDOR", "UNCLE"] as USER_ROLE[]).includes(
        user.value?.userInfo.role ?? "ANONYMOUSE"
      )
    ) {
      router.replace({ name: "Login" });
    }
    return user.value as IoUser;
  };
  const currUserRole = computed(() =>
    user.value ? user.value.userInfo.role : "ANONYMOUSE"
  );
  const uid = computed(() =>
    user.value === null
      ? currUser().userInfo.userId
      : user.value.userInfo.userId
  );
  function setUser(u: IoUser) {
    console.log("user in serUser: ", u);
    user.value = u;
    localStorage.setItem(userKey, JSON.stringify(user.value));
  }
  function login(u: IoUser) {
    console.log("user in login: ", u);
    if (user.value) {
      if (user.value.userInfo.userId === u.userInfo.userId) return;
      else clearUser();
    }
    setUserId(getAnalytics(ioFire.app), u.userInfo.userId);
    setUser(u);
  }

  function clearUser() {
    console.log("user in clearUser: ", user.value);
    localStorage.clear();
    user.value = null;
  }

  async function logout(replace = true) {
    clearUser();
    const auth = getAuth(ioFire.app);
    await signOut(auth);
    if (replace) router.replace({ name: "Login" });
    // map through that list and use the **$reset** fn to reset the state
    const pinia = getActivePinia();
    console.log("pinia:", pinia);
    if (pinia) {
      (pinia as any)._s.forEach((store: any) => {
        if (store.discard) store.discard();
        if (store.$reset) store.$reset();
        if (store.$dispose) store.$dispose();
      });
    }
  }

  return {
    user,
    currUser,
    currUserRole,
    uid,
    setUser,
    login,
    clearUser,
    logout,
    contractUncles,
  };
});
