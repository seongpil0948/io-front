<script setup lang="ts">
import {
  renderIcon,
  renderRoute,
  getScreenSize,
  ScreenSize,
} from "@/composables";
import type { MenuOption } from "naive-ui";
import { ProductHunt, ShoppingCart } from "@vicons/fa";
const minHeight = "100vh";
const menuOptions: MenuOption[] = [
  {
    label: "상품",
    key: "ProductParent",
    icon: renderIcon(ProductHunt),
    children: [
      {
        label: () => renderRoute("도매처 상품 추가", "ProductAdd"),
        key: "ProductAdd",
      },
      {
        label: () => renderRoute("내상품관리", "ProductManage"),
        key: "ProductManage",
      },
      {
        label: () => renderRoute("매핑관리", "MappingManage"),
        key: "MappingManage",
      },
    ],
  },
  {
    label: "발주관리",
    key: "OrderParent",
    icon: renderIcon(ShoppingCart),
    children: [
      {
        label: () => renderRoute("주문해야할 리스트", "OrderRequire"),
        key: "OrderRequire",
      },
    ],
  },
];
</script>

<template>
  <n-space vertical>
    <n-layout v-if="getScreenSize() === ScreenSize.L">
      <n-layout has-sider :style="`min-height: ${minHeight}`">
        <io-sider
          :style="`min-height: ${minHeight}`"
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
        style="padding: 2%; width: 100%; height: fit-content"
      >
        <router-view />
        <io-footer />
      </n-space>
    </n-layout>
  </n-space>
</template>
