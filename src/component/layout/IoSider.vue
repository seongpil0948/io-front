<script setup lang="ts">
import { ref, toRefs } from "vue";
import type { MenuOption } from "naive-ui";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
const props = defineProps<{
  menuOptions: MenuOption[];
}>();
const router = useRouter();
const authStore = useAuthStore();
const u = authStore.currUser;
const { menuOptions } = toRefs(props);
const collapsed = ref(false);
</script>

<template>
  <n-layout-sider
    v-model:collapsed="collapsed"
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    :native-scrollbar="false"
  >
    <n-space justify="center" align="center">
      <logo-image size="3.5rem" @click="router.goHome(u)" />
      <n-h2
        :style="`${
          collapsed ? 'transform: skew(-9deg, 33deg);' : 'none'
        } ; margin-bottom: -7%`"
      >
        InOut BOX
      </n-h2>
    </n-space>

    <n-divider />
    <n-menu
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
    <prefer-dark :text="!collapsed" />
    <n-button @click="authStore.logout"> 로그아웃 </n-button>
  </n-layout-sider>
</template>
