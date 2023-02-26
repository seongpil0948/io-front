import { renderIcon, renderRoute } from "@/util";
import { CashOutline } from "@vicons/ionicons5";
import { MenuOption } from "naive-ui";
import type { RouteRecordRaw } from "vue-router";

export const cashRoutes = (name: string): RouteRecordRaw => ({
  path: "/cash",
  children: [
    {
      path: "list",
      name: name + "ReqEncashList",
      component: () => import("@/view/cash/ReqEncashList.vue"),
    },
  ],
});

export const cashNavMenu = (name: string): MenuOption => ({
  label: "금액 관리",
  key: "CashManage",
  icon: renderIcon(CashOutline),
  children: [
    {
      label: () => renderRoute("입/출금 요청내역", name + "ReqEncashList"),
      key: name + "ReqEncashList",
    },
  ],
});
