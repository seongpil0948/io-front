<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import { BookOutline as BookIcon } from "@vicons/ionicons5";
import { ProductHunt } from "@vicons/fa";
import { Person as PersonIcon } from "@vicons/carbon";
import { renderIcon, renderRoute } from "@/composables";

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
        label: () => renderRoute("주문내역", "OrderList"),
        key: "OrderList",
      },
      {
        label: () => renderRoute("주문접수", "OrderSubmit"),
        key: "OrderSubmit",
      },
    ],
  },
  {
    label: () => renderRoute("엉클관리", "UncleManage"),
    key: "UncleManage",
    icon: renderIcon(PersonIcon),
  },
];
const minHeight = "100vh";
</script>
<template>
  <n-space vertical>
    <n-layout>
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
  </n-space>
</template>
