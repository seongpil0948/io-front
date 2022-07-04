import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useAuthStore } from "@/stores";
import { USER_ROLE } from "@/types";
import { IoUser } from "@/composables";
export const notAuthName = ["Login", "SignUp", "PlayGround"];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  const role = authStore.currUserRole;
  if (to.path === "/")
    return { name: getHomeName(authStore.currUser.userInfo.role) };
  else if (
    role === USER_ROLE.ANONYMOUSE &&
    (!to.name || !notAuthName.includes(to.name!.toString()))
  ) {
    // >>> TEMP >>>
    // console.log("to login page from router.beforeEach");
    // next({ name: "Login" });
    // <<< TEMP <<<
  } else if (to.meta.allowRoles && !to.meta.allowRoles.includes(role)) {
    if (!from.meta.allowRoles || from.meta.allowRoles.includes(role)) {
      return false;
    } else {
      return { name: getHomeName(authStore.currUser.userInfo.role) };
    }
    // TODO: common store 메시지 큐에 추가해서 보여줘야함
  }
});

router.goHome = (user?: IoUser) => {
  console.log("GO HOME: ", user?.userInfo.role);
  router.push({ name: getHomeName(user?.userInfo.role) });
};
function getHomeName(role?: USER_ROLE) {
  if (!role || role === USER_ROLE.ANONYMOUSE) return "Login";
  else if (role === USER_ROLE.VENDOR) return "VendorHome";
  else if (role === USER_ROLE.SHOP) return "ShopHome";
  else if (role === USER_ROLE.UNCLE) return "UncleHome";
  return "Login";
}
export function getPathByRole() {
  console.log("getPathByRole", useAuthStore, useAuthStore());
  const authStore = useAuthStore();
  const role = authStore.currUserRole;
  if (!role || role === USER_ROLE.ANONYMOUSE) return "/login";
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
