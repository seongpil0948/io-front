import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useAuthStore } from "@/stores";
import { USER_ROLE } from "@/types";
import { IoUser } from "@/composables";

export const notAuthName = ["Login", "SignUp", "PlayGround"];

declare module "vue-router" {
  interface Router {
    goHome(user?: IoUser): void;
  }
}

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (
    authStore.currUserRole === USER_ROLE.ANONYMOUSE &&
    (!to.name || !notAuthName.includes(to.name!.toString()))
  ) {
    // redirect the user to the login page
    return { name: "Login" };
  }
});

router.goHome = (user?: IoUser) => {
  if (!user || user.role === USER_ROLE.ANONYMOUSE) {
    router.push({ name: "Login" });
  } else if (user.role === USER_ROLE.VENDOR) {
    router.push({ name: "VendorHome" });
  } else if (user.role === USER_ROLE.SHOP) {
    router.push({ name: "ShopHome" });
  } else if (user.role === USER_ROLE.UNCLE) {
    router.push({ name: "UncleHome" });
  }
};

export default router;
