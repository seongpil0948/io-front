import { defineStore } from "pinia";
import { getAuth, signOut } from "firebase/auth";
import { IoUser, userFromJson } from "@io-boxies/js-lib";
import { getActivePinia } from "pinia";
import { ioFire } from "@/plugin/firebase";
import { getAnalytics, setUserId } from "@firebase/analytics";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const userKey = "user";
export const useAuthStore = defineStore("auth", () => {
  const user = ref<IoUser | null>(null);
  const router = useRouter();
  const currUser = () => {
    if (!user.value) {
      const userStr = localStorage.getItem(userKey);
      if (userStr) {
        const u = userFromJson(JSON.parse(userStr));
        if (!u) {
          router.replace({ name: "Login" });
        }
        user.value = u!;
        return user.value!;
      } else {
        router.replace({ name: "Login" });
      }
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
    user.value = u;
    localStorage.setItem(userKey, JSON.stringify(user.value));
    setUserId(getAnalytics(ioFire.app), u.userInfo.userId);
  }
  function login(u: IoUser) {
    if (user.value) {
      if (user.value.userInfo.userId === u.userInfo.userId) return;
      else clearUser();
    }
    setUser(u);
  }

  function clearUser() {
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
  };
});
