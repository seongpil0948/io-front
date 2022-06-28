<script setup lang="ts">
import { notAuthName } from "@/plugins/router";

import { useRouter } from "vue-router";

const router = useRouter();
</script>
<template>
  <router-view></router-view>
  <float-action-button
    v-if="
      !notAuthName.includes(router.currentRoute.value.name?.toString() ?? '')
    "
  />
</template>
