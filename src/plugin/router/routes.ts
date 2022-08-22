import { USER_ROLE } from "@/composable";
import type { RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "common" */ "@/view/common/LoginPage.vue"),
  },
  {
    path: "/signup",
    name: "SignUp",

    component: () =>
      import(/* webpackChunkName: "common" */ "@/view/common/SignupPage.vue"),
  },
  {
    path: "/vendor",
    name: "VendorLayout",
    component: () =>
      import(/* webpackChunkName: "vendor" */ "@/view/vendor/VendorLayout.vue"),
    meta: {
      allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
    },
    children: [
      {
        path: "",
        name: "VendorHome",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/VendorHome.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/vendorproductlist",
        name: "VendorProductList",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/VendorProductList.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/productregister",
        name: "ProductRegister",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/ProductRegister.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/samplemanage",
        name: "SampleManage",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/SampleManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/unclemanage",
        name: "UncleManage",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/UncleManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/beforeApproveList",
        name: "BeforeApproveList",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/BeforeApproveList.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/afterApproveList",
        name: "AfterApproveList",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/AfterApproveList.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/paidOrder",
        name: "PaidOrder",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/PaidOrder.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
    ],
  },
  {
    path: "/shop",
    name: "ShopLayout",
    component: () =>
      import(/* webpackChunkName: "shop" */ "@/view/shop/ShopLayout.vue"),
    children: [
      {
        path: "",
        name: "ShopHome",
        component: () =>
          import(/* webpackChunkName: "shop" */ "@/view/shop/ShopHome.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/prodadd",
        name: "ProductAdd",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/ProductAdd.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/prodmng",
        name: "ProductManage",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/ProductManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/mapmng",
        name: "MappingManage",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/MappingManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/orderrequire",
        name: "OrderRequire",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/OrderRequire.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/ordercomplete",
        name: "OrderComplete",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/OrderComplete.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/pickuprequest",
        name: "PickupRequest",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/PickupRequest.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/PendingOrderList",
        name: "PendingOrderList",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/PendingOrderList.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/orderlinkage",
        name: "OrderLinkage",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/OrderLinkage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
    ],
  },
  {
    path: "/uncle",
    name: "UncleLayout",
    component: () =>
      import(/* webpackChunkName: "uncle" */ "@/view/uncle/UncleLayout.vue"),
    children: [
      {
        path: "",
        name: "PickupTotalList",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/PickupTotalList.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "AccidentManage",
        name: "AccidentManage",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/AccidentManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "BillingManage",
        name: "BillingManage",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/BillingManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "VehicleManage",
        name: "VehicleManage",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/VehicleManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "WorkerRegister",
        name: "WorkerRegister",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/WorkerRegister.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
    ],
  },
  {
    path: "/playground",
    name: "PlayGround",
    component: () =>
      import(/* webpackChunkName: "common" */ "@/view/common/PlayGround.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () =>
      import(/* webpackChunkName: "common" */ "@/view/common/UnknownPage.vue"),
  },
];
