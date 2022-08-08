import { defineStore } from "pinia";
import { getAuth, signOut } from "firebase/auth";
import { getMockShops, getMockVendors } from "../../tests/e2e/fixtures/users";
import { IoUser } from "@/composable/auth/model/user";
import { USER_ROLE } from "@/composable/auth/domain";
interface AuthStoreInterface {
  user: IoUser | null;
}
const userKey = "user";
export const useAuthStore = defineStore({
  id: "auth",
  state: () =>
    <AuthStoreInterface>{
      user: process.env.VUE_APP_IS_TEST
        ? // ? IoUser.fromJson(getMockShops()[0])
          IoUser.fromJson(getMockVendors()[0])
        : localStorage.getItem(userKey)
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
      state.user === null ? USER_ROLE.ANONYMOUSE : state.user?.userInfo.role,
  },
  actions: {
    async login(u: IoUser) {
      this.user = u;
      localStorage.setItem(userKey, JSON.stringify(this.user));
    },
    async logout() {
      localStorage.clear();
      this.user = null;
      const auth = getAuth();
      await signOut(auth);
      this.$router.replace({ name: "Login" }); //   this.$http.get("https://www.naver.com");
    },
  },
});
