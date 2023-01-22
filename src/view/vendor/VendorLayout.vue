<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import { ShoppingCart } from "@vicons/fa";
import { ProductHunt, CashRegister } from "@vicons/fa";
import { renderIcon, renderRoute, isMobile } from "@/util";
import {
  People16Regular,
  News16Regular,
  ShoppingBag20Filled,
} from "@vicons/fluent";
import { useAuthStore, useCommonStore, useVendorOrderStore } from "@/store";
import { onBeforeMount, h, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { logoutMenuOpt } from "@/component/button/logout-menu-opt";
const LogoImageVue = defineAsyncComponent(
  () => import("@/component/common/LogoImage.vue")
);
const common = useCommonStore();
const auth = useAuthStore();
const user = auth.currUser;
const store = useVendorOrderStore();
const router = useRouter();
onBeforeMount(() => store.init(user.userInfo.userId));
const menuOptions: MenuOption[] = [
  {
    label: "상품",
    key: "ProductParent",
    icon: renderIcon(ProductHunt),
    children: [
      {
        label: () => renderRoute("상품 등록", "ProductRegister"),
        key: "ProductRegister",
      },
      {
        label: () => renderRoute("상품 목록 조회", "VendorProductList"),
        key: "VendorProductList",
      },
      {
        label: () => renderRoute("상품 입고일 관리", "ProductFillUpMng"),
        key: "ProductFillUpMng",
      },
      {
        label: () => renderRoute("마케팅/광고 관리", "MarketingMng"),
        key: "MarketingMng",
      },
    ],
  },
  {
    label: "주문",
    key: "Order",
    icon: renderIcon(ShoppingCart),
    children: [
      {
        label: () => renderRoute("거래처 요청 주문", "BeforeApproveList"),
        key: "BeforeApproveList",
      },
      {
        label: () => renderRoute("승인 완료된 주문", "AfterApproveList"),
        key: "AfterApproveList",
      },
      {
        label: () => renderRoute("결제완료 / 미송 주문", "PaidOrder"),
        key: "PaidOrder",
      },
      {
        label: () => renderRoute("픽업 대기 주문 ", "PendingOrderMng"),
        key: "PendingOrderMng",
      },
      {
        label: () => renderRoute("수정/반품/취소 관리 ", "ReturnExchange"),
        key: "ReturnExchange",
      },
      {
        label: () => renderRoute("샘플 관리", "SampleManage"),
        key: "SampleManage",
      },
      {
        label: () => renderRoute("결제 관리", "PayMng"),
        key: "PayMng",
      },
    ],
  },
  {
    label: () => renderRoute("거래처 관리", "VendorPartnerMng"),
    key: "VendorPartnerMng",
    icon: renderIcon(People16Regular),
  },
  {
    label: () => renderRoute("고객지원", "CsHome"),
    key: "CsHome",
    icon: renderIcon(News16Regular),
  },
  {
    label: () => renderRoute("포장리스트", "PackingList"),
    key: "PackingList",
    icon: renderIcon(ShoppingBag20Filled),
  },
  {
    label: () => renderRoute("매장/포스 관리", "BuildingPosMng"),
    key: "BuildingPosMng",
    icon: renderIcon(CashRegister),
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
const minHeight = "100vh";
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
      style="padding: 2%; width: 100%"
    >
      <router-view />
      <io-footer />
    </n-space>
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
