import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useAuthStore, useCommonStore } from "@/store";
import { logger } from "../logger";
import { IoUser, USER_ROLE } from "@/composable";
export const notAuthName = ["Login", "SignUp", "PlayGround"];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const role = authStore.currUserRole;
  const notAuth = to.name && notAuthName.includes(to.name.toString());

  if (!notAuth) {
    if (authStore.currUser === null) {
      return { name: "Login" };
    }
    if (to.path === "/") {
      return { name: getHomeName(authStore.currUser.userInfo.role) };
    } else if (to.meta.allowRoles && !to.meta.allowRoles.includes(role)) {
      logger.error(
        authStore.currUser.userInfo.userId,
        "유효하지 않은 페이지 접근",
        to
      );
      useCommonStore().$patch((state) => {
        state.msgQueue.push({
          isError: true,
          content: "소유한 권한에 대해 유효하지 않은 페이지입니다.",
        });
      });
      return { name: getHomeName(authStore.currUser.userInfo.role) };
    }
  }
});

router.goHome = (user?: IoUser) => {
  router.push({ name: getHomeName(user?.userInfo.role) });
};
function getHomeName(role?: USER_ROLE) {
  if (!role) return "Login";
  else if (role === USER_ROLE.VENDOR) return "VendorHome";
  else if (role === USER_ROLE.SHOP) return "ShopHome";
  else if (role === USER_ROLE.UNCLE) return "PickupTotalList";
  return "Login";
}
export function getPathByRole() {
  const authStore = useAuthStore();
  const role = authStore.currUserRole;
  if (!role) return "/login";
  else if (role === USER_ROLE.VENDOR) return "/vendor";
  else if (role === USER_ROLE.SHOP) return "/shop";
  else if (role === USER_ROLE.UNCLE) return "/uncle";
  return "/login";
}

// const auth = getAuth();
// onAuthStateChanged(auth, (user) => {
//   console.log("onAuthStateChanged: ", user);
//   if (!user) {
//     console.log("to login page from onAuthStateChanged");
//     router.replace({ name: "Login" });
//   }
// });
export default router;
