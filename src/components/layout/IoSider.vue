<script setup lang="ts">
import { toRefs } from "vue";
import type { MenuOption } from "naive-ui";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
const props = defineProps<{
  menuOptions: MenuOption[];
}>();
const router = useRouter();
const authStore = useAuthStore();
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
    <n-space justify="center">
      <logo-image @click="router.goHome(authStore.currUser)" size="3.5rem" />
    </n-space>

    <n-divider />
    <n-menu
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
  </n-layout-sider>
</template>
