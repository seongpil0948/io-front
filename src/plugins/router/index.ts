import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useAuthStore } from "@/stores";
import { USER_ROLE } from "@/types";

export const notAuthName = ["Login", "SignUp", "PlayGround"];

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

export default router;
