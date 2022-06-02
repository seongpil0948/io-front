import type { RouteRecordRaw } from "vue-router";

export const DefaultRoot = "/vendor";
export const notAuthName = ["Login", "SignUp", "PlayGround"];
export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: DefaultRoot,
  },
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
    children: [
      {
        path: "",
        name: "VendorHome",
        component: () => import("@/views/vendor/VendorHome.vue"),
      },
      {
        path: "/vendorproductlist",
        name: "VendorProductList",
        component: () => import("@/views/vendor/page/VendorProductList.vue"),
      },
      {
        path: "/productregister",
        name: "ProductRegister",
        component: () => import("@/views/vendor/page/ProductRegister.vue"),
      },
      {
        path: "/samplemanage",
        name: "SampleManage",
        component: () => import("@/views/vendor/page/SampleManage.vue"),
      },
      {
        path: "/orderlist",
        name: "OrderList",
        component: () => import("@/views/vendor/page/OrderList.vue"),
      },
      {
        path: "/ordersubmit",
        name: "OrderSubmit",
        component: () => import("@/views/vendor/page/OrderSubmit.vue"),
      },
      {
        path: "/unclemanage",
        name: "UncleManage",
        component: () => import("@/views/vendor/page/UncleManage.vue"),
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
      },
      {
        path: "/prodadd",
        name: "ProductAdd",
        component: () => import("@/views/shop/page/ProductAdd.vue"),
      },
      {
        path: "/prodmng",
        name: "ProductManage",
        component: () => import("@/views/shop/page/ProductManage.vue"),
      },
      {
        path: "/mapmng",
        name: "MappingManage",
        component: () => import("@/views/shop/page/MappingManage.vue"),
      },
      {
        path: "/orderrequire",
        name: "OrderRequire",
        component: () => import("@/views/shop/page/OrderRequire.vue"),
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
