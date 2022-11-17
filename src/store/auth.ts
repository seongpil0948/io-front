import { defineStore } from "pinia";
import { getAuth, signOut } from "firebase/auth";
import { IoUser, userFromJson } from "@io-boxies/js-lib";
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
    setUser() {
      localStorage.setItem(userKey, JSON.stringify(this.user));
    },
    login(u: IoUser) {
      if (this.user) {
        if (this.user.userInfo.userId === u.userInfo.userId) return;
        else this.clearUser();
      }
      this.user = u;
      this.setUser();
    },
    clearUser() {
      localStorage.clear();
      this.user = null;
    },
    async logout(replace = true) {
      this.clearUser();
      const auth = getAuth();
      await signOut(auth);
      if (replace) this.$router.replace({ name: "Login" }); //   this.$http.get("https://www.naver.com");
    },
  },
});
