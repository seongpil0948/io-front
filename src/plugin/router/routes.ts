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
    path: "/notice",
    name: "NoticePage",

    component: () =>
      import(/* webpackChunkName: "common" */ "@/view/common/NoticePage.vue"),
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
        path: "/productFillUpMng",
        name: "ProductFillUpMng",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/ProductFillUpMng.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/marketingMng",
        name: "MarketingMng",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/MarketingMng.vue"
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
      {
        path: "/pendingOrderMng",
        name: "PendingOrderMng",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/PendingOrderMng.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/returnExchange",
        name: "ReturnExchange",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/ReturnExchange.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/payMng",
        name: "PayMng",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/PayMng.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/vendorPartnerMng",
        name: "VendorPartnerMng",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/VendorPartnerMng.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/packingList",
        name: "PackingList",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/PackingList.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.VENDOR, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/buildingPosMng",
        name: "BuildingPosMng",
        component: () =>
          import(
            /* webpackChunkName: "vendor" */ "@/view/vendor/page/BuildingPosMng.vue"
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
        path: "/pendingOrderList",
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
        path: "/shopReturnExchange",
        name: "ShopReturnExchange",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/ShopReturnExchange.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/sampleReq",
        name: "SampleReq",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/SampleReq.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/payHistory",
        name: "PayHistory",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/PayHistory.vue"
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
      {
        path: "/shopUncleManage",
        name: "ShopUncleManage",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/ShopUncleManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/uncleStatus",
        name: "UncleStatus",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/UncleStatus.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/ioFast",
        name: "IoFast",
        component: () =>
          import(/* webpackChunkName: "shop" */ "@/view/shop/page/IoFast.vue"),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/shopUncleManage",
        name: "ShopUncleManage",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/ShopUncleManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/followPartner",
        name: "FollowPartner",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/FollowPartner.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/taxReport",
        name: "TaxReport",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/TaxReport.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.SHOP, USER_ROLE.ADMIN],
        },
      },
      {
        path: "/orderHistory",
        name: "OrderHistory",
        component: () =>
          import(
            /* webpackChunkName: "shop" */ "@/view/shop/page/OrderHistoryPage.vue"
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
        name: "UncleHome",
        component: () =>
          import(/* webpackChunkName: "uncle" */ "@/view/uncle/UncleHome.vue"),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "pickupTotalList",
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
        path: "requestHistory",
        name: "RequestHistory",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/RequestHistory.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "mngInCharge",
        name: "MngInCharge",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/MngInCharge.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },

      {
        path: "billingManage",
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
        path: "mngSalary",
        name: "MngSalary",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/MngSalary.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "mngMaintainCost",
        name: "MngMaintainCost",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/MngMaintainCost.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "vehicleManage",
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
        path: "shipAreaManage",
        name: "ShipAreaManage",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/ShipAreaManage.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "shipHistory",
        name: "ShipHistory",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/ShipHistory.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "workerRegister",
        name: "WorkerRegister",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/WorkerRegister.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "workerHistory",
        name: "WorkerHistory",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/WorkerHistory.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "accidentManage",
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
        path: "accidentHistory",
        name: "AccidentHistory",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/AccidentHistory.vue"
          ),
        meta: {
          allowRoles: [USER_ROLE.UNCLE, USER_ROLE.ADMIN],
        },
      },
      {
        path: "unclePartnerManage",
        name: "UnclePartnerManage",
        component: () =>
          import(
            /* webpackChunkName: "uncle" */ "@/view/uncle/page/UnclePartnerManage.vue"
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
