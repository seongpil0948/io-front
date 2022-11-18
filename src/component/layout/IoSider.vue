<script setup lang="ts">
import { ref, toRefs } from "vue";
import type { MenuOption } from "naive-ui";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store";
import { SignOut20Regular } from "@vicons/fluent";

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
    <prefer-dark
      :text="!collapsed"
      style="margin-top: 10%; margin-bottom: 10%"
    />
    <n-button style="width: 80%; min-height: 40px" @click="authStore.logout">
      <n-text v-if="!collapsed">로그아웃</n-text>
      <n-icon v-else :component="SignOut20Regular" size="24"></n-icon>
    </n-button>
  </n-layout-sider>
</template>
