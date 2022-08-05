<script setup lang="ts">
import type { MenuOption } from "naive-ui";
import { ProductHunt, ShoppingCart } from "@vicons/fa";
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";
import { renderIcon, renderRoute, getScreenSize, ScreenSize } from "@/util";
const minHeight = "100vh";
const router = useRouter();
const authStore = useAuthStore();
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
    label: "주문관리",
    key: "OrderParent",
    icon: renderIcon(ShoppingCart),
    children: [
      {
        label: () => renderRoute("주문 해야할 상품", "OrderRequire"),
        key: "OrderRequire",
      },
      {
        label: () => renderRoute("주문 완료된 상품", "OrderComplete"),
        key: "OrderComplete",
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
        <logo-image
          style="position: absolute; left: 3%; top: 1%"
          @click="router.goHome(authStore.currUser)"
          size="1.8rem"
        />
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
