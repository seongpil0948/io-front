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
    path: "/cs",
    name: "Cs",
    component: () => import("@/view/cs/CsLayout.vue"),
    children: [
      {
        path: "",
        name: "CsHome",
        component: () => import("@/view/cs/CsHome.vue"),
      },
      {
        path: "home",
        name: "CsHome",
        component: () => import("@/view/cs/CsHome.vue"),
      },
      {
        path: "faqByCtgr",
        name: "FaqByCtgr", // FaqByCategory
        component: () => import("@/view/cs/FaqByCtgr.vue"),
      },
      {
        path: "detail",
        name: "CsDetail",
        component: () => import("@/view/cs/CsDetail.vue"),
      },
    ],
  },
  {
    path: "/vendor",
    name: "VendorLayout",
    component: () => import("@/view/vendor/VendorLayout.vue"),
    meta: {
      allowRoles: ["VENDOR", "ADMIN"],
    },
    children: [
      {
        path: "",
        name: "VendorHome",
        component: () => import("@/view/vendor/VendorHome.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "vendorproductlist",
        name: "VendorProductList",
        component: () => import("@/view/vendor/page/VendorProductList.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "productregister",
        name: "ProductRegister",
        component: () => import("@/view/vendor/page/ProductRegister.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "productFillUpMng",
        name: "ProductFillUpMng",
        component: () => import("@/view/vendor/page/ProductFillUpMng.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "marketingMng",
        name: "MarketingMng",
        component: () => import("@/view/vendor/page/MarketingMng.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "samplemanage",
        name: "SampleManage",
        component: () => import("@/view/vendor/page/SampleManage.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "beforeApproveList",
        name: "BeforeApproveList",
        component: () => import("@/view/vendor/page/BeforeApproveList.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "afterApproveList",
        name: "AfterApproveList",
        component: () => import("@/view/vendor/page/AfterApproveList.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "paidOrder",
        name: "PaidOrder",
        component: () => import("@/view/vendor/page/PaidOrder.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "pendingOrderMng",
        name: "PendingOrderMng",
        component: () => import("@/view/vendor/page/PendingOrderMng.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "returnExchange",
        name: "ReturnExchange",
        component: () => import("@/view/vendor/page/ReturnExchange.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "payMng",
        name: "PayMng",
        component: () => import("@/view/vendor/page/PayMng.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "vendorPartnerMng",
        name: "VendorPartnerMng",
        component: () => import("@/view/vendor/page/VendorPartnerMng.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "packingList",
        name: "PackingList",
        component: () => import("@/view/vendor/page/PackingList.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
        },
      },
      {
        path: "buildingPosMng",
        name: "BuildingPosMng",
        component: () => import("@/view/vendor/page/BuildingPosMng.vue"),
        meta: {
          allowRoles: ["VENDOR", "ADMIN"],
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
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "prodadd",
        name: "ProductAdd",
        component: () => import("@/view/shop/page/ProductAdd.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "prodmng",
        name: "ProductManage",
        component: () => import("@/view/shop/page/ProductManage.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "virtualManage",
        name: "VirtualManage",
        component: () => import("@/view/shop/page/VirtualManage.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "orderrequire",
        name: "OrderRequire",
        component: () => import("@/view/shop/page/OrderRequire.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "ordercomplete",
        name: "OrderComplete",
        component: () => import("@/view/shop/page/OrderComplete.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "pendingOrderList",
        name: "PendingOrderList",
        component: () => import("@/view/shop/page/PendingOrderList.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "shopReturnExchange",
        name: "ShopReturnExchange",
        component: () => import("@/view/shop/page/ShopReturnExchange.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "sampleReq",
        name: "SampleReq",
        component: () => import("@/view/shop/page/SampleReq.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "payHistory",
        name: "PayHistory",
        component: () => import("@/view/shop/page/PayHistory.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "pickuprequest",
        name: "PickupRequest",
        component: () => import("@/view/shop/page/PickupRequest.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "orderlinkage",
        name: "OrderLinkage",
        component: () => import("@/view/shop/page/OrderLinkage.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "shopUncleManage",
        name: "ShopUncleManage",
        component: () => import("@/view/shop/page/ShopUncleManage.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "uncleStatus",
        name: "UncleStatus",
        component: () => import("@/view/shop/page/UncleStatus.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "ioFast",
        name: "IoFast",
        component: () => import("@/view/shop/page/IoFast.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "shopUncleManage",
        name: "ShopUncleManage",
        component: () => import("@/view/shop/page/ShopUncleManage.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "followPartner",
        name: "FollowPartner",
        component: () => import("@/view/shop/page/FollowPartner.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "taxReport",
        name: "TaxReport",
        component: () => import("@/view/shop/page/TaxReport.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
        },
      },
      {
        path: "orderHistory",
        name: "OrderHistory",
        component: () => import("@/view/shop/page/OrderHistoryPage.vue"),
        meta: {
          allowRoles: ["SHOP", "ADMIN"],
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
        name: "UncleHome",
        component: () => import("@/view/uncle/UncleHome.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "pickupTotalList",
        name: "PickupTotalList",
        component: () => import("@/view/uncle/page/PickupTotalList.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "requestHistory",
        name: "RequestHistory",
        component: () => import("@/view/uncle/page/RequestHistory.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "mngInCharge",
        name: "MngInCharge",
        component: () => import("@/view/uncle/page/MngInCharge.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },

      {
        path: "billingManage",
        name: "BillingManage",
        component: () => import("@/view/uncle/page/BillingManage.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "mngSalary",
        name: "MngSalary",
        component: () => import("@/view/uncle/page/MngSalary.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "mngMaintainCost",
        name: "MngMaintainCost",
        component: () => import("@/view/uncle/page/MngMaintainCost.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "vehicleManage",
        name: "VehicleManage",
        component: () => import("@/view/uncle/page/VehicleManage.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "shipAreaManage",
        name: "ShipAreaManage",
        component: () => import("@/view/uncle/page/ShipAreaManage.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "shipHistory",
        name: "ShipHistory",
        component: () => import("@/view/uncle/page/ShipHistory.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "workerRegister",
        name: "WorkerRegister",
        component: () => import("@/view/uncle/page/WorkerRegister.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "workerHistory",
        name: "WorkerHistory",
        component: () => import("@/view/uncle/page/WorkerHistory.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "accidentManage",
        name: "AccidentManage",
        component: () => import("@/view/uncle/page/AccidentManage.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "accidentHistory",
        name: "AccidentHistory",
        component: () => import("@/view/uncle/page/AccidentHistory.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
        },
      },
      {
        path: "unclePartnerManage",
        name: "UnclePartnerManage",
        component: () => import("@/view/uncle/page/UnclePartnerManage.vue"),
        meta: {
          allowRoles: ["UNCLE", "ADMIN"],
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
