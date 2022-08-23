<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import { BookOutline as BookIcon } from "@vicons/ionicons5";
import { ProductHunt } from "@vicons/fa";
import { Person as PersonIcon } from "@vicons/carbon";
import { renderIcon, renderRoute, ScreenSize, getScreenSize } from "@/util";

const menuOptions: MenuOption[] = [
  {
    label: "상품",
    key: "ProductParent",
    icon: renderIcon(ProductHunt),
    children: [
      {
        label: () => renderRoute("상품목록", "VendorProductList"),
        key: "VendorProductList",
      },
      {
        label: () => renderRoute("상품등록", "ProductRegister"),
        key: "ProductRegister",
      },

      {
        label: () => renderRoute("샘플관리", "SampleManage"),
        key: "SampleManage",
      },
    ],
  },
  {
    label: "주문",
    key: "Order",
    icon: renderIcon(BookIcon),
    children: [
      {
        label: () => renderRoute("거래처 주문 요청", "BeforeApproveList"),
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
    ],
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
