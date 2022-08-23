<script setup lang="ts">
import { IoUser } from "@/composable";
import { onBeforeMount, ref, toRefs } from "vue";

const props = defineProps<{
  uncleUser: IoUser;
}>();
const { uncleUser: uncle } = toRefs(props);
onBeforeMount(() => {
  if (!uncle.value.uncleInfo) throw new Error("props user is not uncle");
});
const info = uncle.value.userInfo;
const uInfo = uncle.value.uncleInfo!;
const title = info.displayName ?? info.userName;
</script>
<template>
  <n-card :title="title"> </n-card>
</template>
