import { USER_ROLE } from "@/types";
import type { RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/common/LoginPage.vue"),
  },
  {
    path: "/signup",
    name: "SignUp",

    component: () => import("@/views/common/SignupPage.vue"),
  },
  {
    path: "/vendor",
    name: "VendorLayout",
    component: () => import("@/views/vendor/VendorLayout.vue"),
    meta: {
      allowRoles: [USER_ROLE.VENDOR],
    },
    children: [
      {
        path: "",
        name: "VendorHome",
        component: () => import("@/views/vendor/VendorHome.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR],
        },
      },
      {
        path: "/vendorproductlist",
        name: "VendorProductList",
        component: () => import("@/views/vendor/page/VendorProductList.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR],
        },
      },
      {
        path: "/productregister",
        name: "ProductRegister",
        component: () => import("@/views/vendor/page/ProductRegister.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR],
        },
      },
      {
        path: "/samplemanage",
        name: "SampleManage",
        component: () => import("@/views/vendor/page/SampleManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR],
        },
      },
      {
        path: "/unclemanage",
        name: "UncleManage",
        component: () => import("@/views/vendor/page/UncleManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR],
        },
      },
      {
        path: "/beforeApproveList",
        name: "BeforeApproveList",
        component: () => import("@/views/vendor/page/BeforeApproveList.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR],
        },
      },
      {
        path: "/afterApproveList",
        name: "AfterApproveList",
        component: () => import("@/views/vendor/page/AfterApproveList.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR],
        },
      },
    ],
  },
  {
    path: "/shop",
    name: "ShopLayout",
    component: () => import("@/views/shop/ShopLayout.vue"),
    children: [
      {
        path: "",
        name: "ShopHome",
        component: () => import("@/views/shop/ShopHome.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP],
        },
      },
      {
        path: "/prodadd",
        name: "ProductAdd",
        component: () => import("@/views/shop/page/ProductAdd.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP],
        },
      },
      {
        path: "/prodmng",
        name: "ProductManage",
        component: () => import("@/views/shop/page/ProductManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP],
        },
      },
      {
        path: "/mapmng",
        name: "MappingManage",
        component: () => import("@/views/shop/page/MappingManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP],
        },
      },
      {
        path: "/orderrequire",
        name: "OrderRequire",
        component: () => import("@/views/shop/page/OrderRequire.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP],
        },
      },
      {
        path: "/ordercomplete",
        name: "OrderComplete",
        component: () => import("@/views/shop/page/OrderComplete.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP],
        },
      },
    ],
  },
  {
    path: "/uncle",
    name: "UncleLayout",
    component: () => import("@/views/uncle/UncleLayout.vue"),
    children: [
      {
        path: "",
        name: "UncleHome",
        component: () => import("@/views/uncle/UncleHome.vue"),
        meta: {
          allowRoles: [USER_ROLE.UNCLE],
        },
      },
    ],
  },
  {
    path: "/playground",
    name: "PlayGround",
    component: () => import("@/views/common/PlayGround.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/views/common/UnknownPage.vue"),
  },
];
