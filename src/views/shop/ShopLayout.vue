<script setup lang="ts">
import { renderIcon, renderRoute } from "@/composables";
import type { MenuOption } from "naive-ui";
import { ProductHunt, ShoppingCart } from "@vicons/fa";
const minHeight = "95vh";
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
    <n-layout>
      <layout-header />
      <n-layout has-sider :style="`min-height: ${minHeight}`">
        <io-sider
          :style="`min-height: ${minHeight}`"
          :menuOptions="menuOptions"
        />
        <div style="padding: 2%; width: 100%"><router-view /></div>
      </n-layout>

      <!-- <n-layout-footer bordered> Footer Footer Footer </n-layout-footer> -->
    </n-layout>
  </n-space>
</template>
