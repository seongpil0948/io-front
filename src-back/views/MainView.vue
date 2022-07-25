<script setup lang="ts">
import { makeMsgOpt } from "@/composables";
import { notAuthName } from "@/plugins/router";
import { useCommonStore } from "@/stores";
import { useLoadingBar, useMessage } from "naive-ui";
import { watch, watchPostEffect } from "vue";
import { useLogger } from "vue-logger-plugin";
import { useRouter } from "vue-router";
/* 
this view consumes Global State(common) 
*/
const cs = useCommonStore();
const loading = useLoadingBar();
const msg = useMessage();
const router = useRouter();
const log = useLogger();

watch(
  () => cs.isLoading,
  (newVal) => {
    log.debug(null, "MainView watch in Loading");
    if (newVal) loading.start();
    else loading.finish();
  }
);

watchPostEffect(() => {
  for (let i = 0; i < cs.msgQueue.length; i++) {
    const q = cs.msgQueue[i];
    if (q.isError) {
      msg.error(q.content, makeMsgOpt());
    } else {
      msg.info(q.content, makeMsgOpt());
    }
  }
});
</script>
<template>
  <n-spin size="large" :show="cs.showSpin">
    <router-view></router-view>
  </n-spin>
  <float-action-button
    v-if="
      !notAuthName.includes(router.currentRoute.value.name?.toString() ?? '')
    "
  />
</template>
