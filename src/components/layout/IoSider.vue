<script setup lang="ts">
import { toRefs } from "vue";
import type { MenuOption } from "naive-ui";
const props = defineProps<{
  menuOptions: MenuOption[];
}>();

const { menuOptions } = toRefs(props);
</script>

<template>
  <n-layout-sider
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    :native-scrollbar="false"
  >
    <n-menu
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
  </n-layout-sider>
</template>
