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
const uidModel = ref<string | null>(null);
</script>

<template>
  <n-layout-sider
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    :native-scrollbar="false"
    v-model:collapsed="collapsed"
  >
    <n-space justify="center" align="center">
      <logo-image @click="router.goHome(u)" size="3.5rem" />
      <n-h2
        :style="`${
          collapsed ? 'transform: skew(-9deg, 33deg);' : 'none'
        } ; margin-bottom: -7%`"
        >InOut BOX</n-h2
      >
    </n-space>

    <n-divider />
    <n-menu
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
    <prefer-dark :text="!collapsed" />
    <n-space
      style="margin-top: 10px"
      vertical
      align="end"
      v-if="u.userInfo.role === 'ADMIN'"
    >
      당신은 관리자 계정입니다.
      <n-input
        v-model:value="uidModel"
        type="text"
        placeholder="user id 입력"
      />
    </n-space>
  </n-layout-sider>
</template>
