import { USER_ROLE } from "@/composable";
import type { RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/view/common/LoginPage.vue"),
  },
  {
    path: "/signup",
    name: "SignUp",

    component: () => import("@/view/common/SignupPage.vue"),
  },
  {
    path: "/vendor",
    name: "VendorLayout",
    component: () => import("@/view/vendor/VendorLayout.vue"),
    meta: {
      allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
    },
    children: [
      {
        path: "",
        name: "VendorHome",
        component: () => import("@/view/vendor/VendorHome.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/vendorproductlist",
        name: "VendorProductList",
        component: () => import("@/view/vendor/page/VendorProductList.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/productregister",
        name: "ProductRegister",
        component: () => import("@/view/vendor/page/ProductRegister.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/samplemanage",
        name: "SampleManage",
        component: () => import("@/view/vendor/page/SampleManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/unclemanage",
        name: "UncleManage",
        component: () => import("@/view/vendor/page/UncleManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/beforeApproveList",
        name: "BeforeApproveList",
        component: () => import("@/view/vendor/page/BeforeApproveList.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/afterApproveList",
        name: "AfterApproveList",
        component: () => import("@/view/vendor/page/AfterApproveList.vue"),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
    ],
  },
  {
    path: "/shop",
    name: "ShopLayout",
    component: () => import("@/view/shop/ShopLayout.vue"),
    children: [
      {
        path: "",
        name: "ShopHome",
        component: () => import("@/view/shop/ShopHome.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/prodadd",
        name: "ProductAdd",
        component: () => import("@/view/shop/page/ProductAdd.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/prodmng",
        name: "ProductManage",
        component: () => import("@/view/shop/page/ProductManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/mapmng",
        name: "MappingManage",
        component: () => import("@/view/shop/page/MappingManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/orderrequire",
        name: "OrderRequire",
        component: () => import("@/view/shop/page/OrderRequire.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/ordercomplete",
        name: "OrderComplete",
        component: () => import("@/view/shop/page/OrderComplete.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/pickuprequest",
        name: "PickupRequest",
        component: () => import("@/view/shop/page/PickupRequest.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/PendingOrderList",
        name: "PendingOrderList",
        component: () => import("@/view/shop/page/PendingOrderList.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/orderlinkage",
        name: "OrderLinkage",
        component: () => import("@/view/shop/page/OrderLinkage.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
    ],
  },
  {
    path: "/uncle",
    name: "UncleLayout",
    component: () => import("@/view/uncle/UncleLayout.vue"),
    children: [
      {
        path: "",
        name: "PickupTotalList",
        component: () => import("@/view/uncle/page/PickupTotalList.vue"),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "AccidentManage",
        name: "AccidentManage",
        component: () => import("@/view/uncle/page/AccidentManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "BillingManage",
        name: "BillingManage",
        component: () => import("@/view/uncle/page/BillingManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "VehicleManage",
        name: "VehicleManage",
        component: () => import("@/view/uncle/page/VehicleManage.vue"),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "WorkerRegister",
        name: "WorkerRegister",
        component: () => import("@/view/uncle/page/WorkerRegister.vue"),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
    ],
  },
  {
    path: "/playground",
    name: "PlayGround",
    component: () => import("@/view/common/PlayGround.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/view/common/UnknownPage.vue"),
  },
];
