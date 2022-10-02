<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import { BookOutline as BookIcon } from "@vicons/ionicons5";
import { ProductHunt, CashRegister } from "@vicons/fa";
import { renderIcon, renderRoute, ScreenSize, getScreenSize } from "@/util";
import {
  People16Regular,
  News16Regular,
  ShoppingBag20Filled,
} from "@vicons/fluent";
import { useAuthStore, useVendorOrderStore } from "@/store";
import { onBeforeMount } from "vue";

const auth = useAuthStore();
const user = auth.currUser;
const store = useVendorOrderStore();
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
