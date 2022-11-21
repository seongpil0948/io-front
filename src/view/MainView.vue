<script setup lang="ts">
import { notAuthName } from "@/plugin/router";
import { useCommonStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { useLoadingBar, useMessage } from "naive-ui";
import { watch, watchPostEffect } from "vue";
import { useLogger } from "vue-logger-plugin";
import { useRouter } from "vue-router";
import { Reload } from "@vicons/ionicons5";
// this view consumes Global State(common)
const cs = useCommonStore();
const loading = useLoadingBar();
const msg = useMessage();
const log = useLogger();
const router = useRouter();
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
  <n-spin id="main-spin" size="large" :show="cs.showSpin">
    <template #icon>
      <n-icon>
        <Reload />
      </n-icon>
    </template>
    <router-view />
  </n-spin>
  <float-action-button
    v-if="
      !notAuthName.includes(router.currentRoute.value.name?.toString() ?? '')
    "
  />
</template>

<style>
#main-spin > .n-spin-body {
  top: 30%;
}
</style>
