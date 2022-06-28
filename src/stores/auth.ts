import { IoUser } from "@/composables";
import { USER_ROLE } from "@/types";
import { defineStore } from "pinia";
import { getAuth, signOut } from "firebase/auth";
// >>> TEMP >>>
import shops from "../../tests/e2e/fixtures/users/shops";
import vendors from "../../tests/e2e/fixtures/users/vendors";
// <<< TEMP <<<
interface AuthStoreInterface {
  user: IoUser | null;
}
const userKey = "user";
export const useAuthStore = defineStore({
  id: "auth",
  state: () =>
    <AuthStoreInterface>{
      // user: localStorage.getItem(userKey)
      //   ? IoUser.fromJson(JSON.parse(localStorage.getItem(userKey)!))
      //   : null,
      // >>> TEMP >>>
      user: IoUser.fromJson(shops[0]) ?? IoUser.fromJson(vendors[0]),
      // <<< TEMP <<<
    },
  getters: {
    currUser(): IoUser {
      if (!this.user) {
        // >>> TEMP >>>
        // this.$router.replace({ name: "Login" });
        // >>> TEMP >>>
      }
      return this.user as IoUser;
    },
    // Getters are exactly the equivalent of computed
    currUserRole: (state) =>
      state.user === null ? USER_ROLE.ANONYMOUSE : state.user?.userInfo.role,
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
      const auth = getAuth();
      console.log("sign out Auth", auth);
      await signOut(auth);
      this.$router.replace({ name: "Login" }); //   this.$http.get("https://www.naver.com");
    },
  },
});
