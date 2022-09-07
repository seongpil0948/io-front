<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import { BookOutline as BookIcon } from "@vicons/ionicons5";
import { ProductHunt, CashRegister } from "@vicons/fa";
import { Person as PersonIcon } from "@vicons/carbon";
import { renderIcon, renderRoute, ScreenSize, getScreenSize } from "@/util";
import {
  People16Regular,
  News16Regular,
  ShoppingBag20Filled,
} from "@vicons/fluent";
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
        label: () => renderRoute("상품 목록 조회", "MarketingMng"),
        key: "MarketingMng",
      },
    ],
  },
  {
    label: "주문",
    key: "Order",
    icon: renderIcon(BookIcon),
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
        label: () => renderRoute("결제 완료된 주문", "PaidOrder"),
        key: "PaidOrder",
      },
      {
        label: () => renderRoute("미송 주문 관리 ", "PendingOrderMng"),
        key: "PendingOrderMng",
      },
      {
        label: () => renderRoute("교환/반품 관리 ", "ReturnExchange"),
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
    label: () => renderRoute("공지사항", "NoticePage"),
    key: "NoticePage",
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
  {
    label: () => renderRoute("엉클관리", "VendorUncleManage"),
    key: "VendorUncleManage",
    icon: renderIcon(PersonIcon),
  },
];
const minHeight = "100vh";
</script>
<template>
  <n-space vertical>
    <n-layout v-if="getScreenSize() === ScreenSize.L">
      <n-layout has-sider :style="`min-height: ${minHeight}`">
        <io-sider
          :style="`min-height: ${minHeight};`"
          :menuOptions="menuOptions"
        />
        <n-space
          vertical
          justify="space-between"
          style="padding: 2%; width: 100%"
        >
          <router-view />
          <io-footer />
        </n-space>
      </n-layout>
      <!-- <n-layout-footer bordered> Footer Footer Footer </n-layout-footer> -->
    </n-layout>
    <n-layout v-else :style="`height: ${minHeight}`">
      <n-layout-header>
        <n-menu
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
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
  </n-space>
</template>
