import { defineStore } from "pinia";
import { getAuth, signOut } from "firebase/auth";
import { IoUser, userFromJson } from "@io-boxies/js-lib";
import { getActivePinia } from "pinia";
import { ioFire } from "@/plugin/firebase";
interface AuthStoreInterface {
  user: IoUser | null;
}
const userKey = "user";
export const useAuthStore = defineStore({
  id: "auth",
  state: () =>
    <AuthStoreInterface>{
      user: null,
    },
  getters: {
    currUser(): IoUser {
      if (!this.user) {
        const userStr = localStorage.getItem(userKey);
        if (userStr) {
          const u = userFromJson(JSON.parse(userStr));
          if (!u) {
            this.$router.replace({ name: "Login" });
          }
          this.user = u!;
          return u!;
        } else {
          this.$router.replace({ name: "Login" });
        }
      }
      return this.user as IoUser;
    },
    // Getters are exactly the equivalent of computed
    currUserRole: (state) =>
      state.user === null ? "ANONYMOUSE" : state.user?.userInfo.role,
  },
  actions: {
    setUser(u: IoUser) {
      this.user = u;
      localStorage.setItem(userKey, JSON.stringify(this.user));
    },
    login(u: IoUser) {
      if (this.user) {
        if (this.user.userInfo.userId === u.userInfo.userId) return;
        else this.clearUser();
      }
      this.setUser(u);
    },
    clearUser() {
      localStorage.clear();
      this.user = null;
    },
    async logout(replace = true) {
      this.clearUser();
      const auth = getAuth(ioFire.app);
      await signOut(auth);
      if (replace) this.$router.replace({ name: "Login" });
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
    },
  },
});
