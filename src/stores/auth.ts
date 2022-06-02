import { IoUser } from "@/composables";
import { USER_ROLE } from "@/types";
import { defineStore } from "pinia";

interface AuthStoreInterface {
  user: IoUser | null;
}
const userKey = "user";
export const useAuthStore = defineStore({
  id: "auth",
  state: () =>
    <AuthStoreInterface>{
      user: localStorage.getItem(userKey)
        ? IoUser.fromJson(JSON.parse(localStorage.getItem(userKey)!))
        : null,
    },
  getters: {
    currUser(): IoUser {
      if (!this.user) {
        this.$router.replace({ name: "Login" });
      }
      return this.user as IoUser;
    },
    // Getters are exactly the equivalent of computed
    currUserRole: (state) =>
      state.user === null ? USER_ROLE.ANONYMOUSE : state.user!.role,
  },
  actions: {
    async login(u: IoUser) {
      this.user = u;
      localStorage.setItem(userKey, JSON.stringify(this.user));
      //   this.$http.get("https://www.naver.com");
    },
    async logout() {
      localStorage.clear();
      this.user = null;
      this.$router.replace({ name: "Login" }); //   this.$http.get("https://www.naver.com");
    },
  },
});
