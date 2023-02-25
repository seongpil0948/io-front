<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import { ProductHunt, ShoppingCart } from "@vicons/fa";
import { useAuthStore, useCommonStore, useShopOrderStore } from "@/store";
import { useRouter } from "vue-router";
import { renderIcon, renderRoute, isMobile } from "@/util";
import { LocalShippingRound } from "@vicons/material";
import { People16Regular, News16Regular } from "@vicons/fluent";
import { onBeforeMount, h, defineAsyncComponent } from "vue";
import { logoutMenuOpt } from "@/component/button/logout-menu-opt";
import { cashNavMenu } from "@/plugin/router/common";
const LogoImageVue = defineAsyncComponent(
  () => import("@/component/common/LogoImage.vue")
);

const minHeight = "100vh";
const router = useRouter();
const authStore = useAuthStore();
const common = useCommonStore();
const user = authStore.currUser();

const shopOrderStore = useShopOrderStore();
onBeforeMount(() => shopOrderStore.init(user.userInfo.userId));

const menuOptions: MenuOption[] = [
  {
    label: "상품 관리",
    key: "ProductParent",
    icon: renderIcon(ProductHunt),
    children: [
      {
        label: () => renderRoute("도매 상품 등록", "ProductAdd"),
        key: "ProductAdd",
      },
      {
        label: () => renderRoute("등록 상품 조회", "ProductManage"),
        key: "ProductManage",
      },
      {
        label: () => renderRoute("가상 상품 관리", "VirtualManage"),
        key: "VirtualManage",
      },
    ],
  },
  {
    label: "주문관리",
    key: "OrderParent",
    icon: renderIcon(ShoppingCart),
    children: [
      {
        label: () => renderRoute("주문 해야할 주문", "OrderRequire"),
        key: "OrderRequire",
      },
      {
        label: () => renderRoute("승인 완료된 주문", "OrderComplete"),
        key: "OrderComplete",
      },
      {
        label: () => renderRoute("미송 주문 조회", "PendingOrderList"),
        key: "PendingOrderList",
      },
      {
        label: () => renderRoute("교환/반품 관리", "ShopReturnExchange"),
        key: "ShopReturnExchange",
      },
      {
        label: () => renderRoute("샘플요청", "SampleReq"),
        key: "SampleReq",
      },
      {
        label: () => renderRoute("결제내역 조회", "PayHistory"),
        key: "PayHistory",
      },
      {
        label: () => renderRoute("픽업 요청", "PickupRequest"),
        key: "PickupRequest",
      },
      {
        label: () => renderRoute("주문 연동", "OrderLinkage"),
        key: "OrderLinkage",
      },
    ],
  },
  {
    label: "배송/엉클",
    key: "ShipUncle",
    icon: renderIcon(LocalShippingRound),
    children: [
      {
        label: () => renderRoute("엉클 관리(계약)", "ShopUncleManage"),
        key: "ShopUncleManage",
      },
      {
        label: () => renderRoute("픽업 현황 목록", "UncleStatus"),
        key: "UncleStatus",
      },
      {
        label: () => renderRoute("IO패스트 (준비중)", "IoFast"),
        key: "IoFast",
      },
    ],
  },
  {
    label: "거래처 관리",
    key: "PartnerManage",
    icon: renderIcon(People16Regular),
    children: [
      {
        label: () => renderRoute("거래처 관리", "FollowPartner"),
        key: "FollowPartner",
      },
      {
        label: () => renderRoute("세금계산서 조회", "TaxReport"),
        key: "TaxReport",
      },
      {
        label: () => renderRoute("거래내역 조회", "OrderHistory"),
        key: "OrderHistory",
      },
    ],
  },
  cashNavMenu("Shop"),
  {
    label: () => renderRoute("고객지원", "CsHome"),
    key: "CsHome",
    icon: renderIcon(News16Regular),
  },
];
const mobileOpts = [
  {
    key: "home",
    icon: () =>
      h(LogoImageVue, {
        size: "1.8rem",
        style: { "margin-top": "23%" },
        onclick: () => {
          router.goHome(user);
        },
      }),
  },
  ...menuOptions,
  logoutMenuOpt(),
];
</script>

<template>
  <n-layout
    v-if="common.screenWidth === 'S' || isMobile()"
    :style="`height: ${minHeight}`"
  >
    <n-layout-header style="overflow: auto; width: 100%">
      <n-menu
        style="width: max-content"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="mobileOpts"
        mode="horizontal"
      />
    </n-layout-header>
    <n-space
      vertical
      justify="space-between"
      align="center"
      style="padding: 2%; width: 100%; height: fit-content; max-width: 95vw"
    >
      <router-view />
    </n-space>
    <io-footer />
  </n-layout>
  <n-layout v-else>
    <n-layout has-sider :style="`min-height: ${minHeight}`">
      <io-sider
        :style="`min-height: ${minHeight}`"
        :menu-options="menuOptions"
      />
      <n-space
        vertical
        justify="space-between"
        style="padding: 2%; width: 100%; overflow: auto"
      >
        <router-view />
        <io-footer />
      </n-space>
    </n-layout>
    <!-- <n-layout-footer bordered> Footer Footer Footer </n-layout-footer> -->
  </n-layout>
</template>
