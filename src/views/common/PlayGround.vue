<script setup lang="ts">
import { IoFire } from "@/plugins/firebase";
import { getCurrentInstance, onMounted } from "vue";

const inst = getCurrentInstance();
// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
onMounted(() => {
  const fire: IoFire = inst?.appContext.config.globalProperties.$fire;
  console.log("Instance: ", inst);
  console.log("IO FIRE: ", fire);
});
</script>
<template>
  <n-h1>Play Ground</n-h1>
</template>
