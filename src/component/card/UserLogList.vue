<script setup lang="ts">
import { useReadLogger } from "@/plugin/logger";
import { useAuthStore } from "@/store";
import { isObject } from "@/util";
import { computed } from "vue";

const authStore = useAuthStore();

const { userLogs } = useReadLogger({
  uids: [authStore.currUser.userInfo.userId],
  limit: 30,
  severity: ["error"],
});

const logTxts = computed(() => {
  const txts: string[][] = [];
  const parseTxts = (ts: { [b: string]: any | string }[]) => {
    const texts: string[] = [];
    for (let t = 0; t < ts.length; t++) {
      const txt = ts[t];
      if (typeof txt === "string") {
        texts.push(txt);
      } else if (isObject(txt)) {
        texts.push(JSON.stringify(txt).substring(0, 18));
      }
      break;
    }
    return texts.join(" ");
  };
  userLogs.value.forEach((x) => {
    txts.push([
      `[${x.severity}]`,
      `${parseTxts(x.txts)} ${x.createdAt?.toLocaleString()}`,
    ]);
  });
  return txts;
});
function onScroll(e: any) {
  console.log("ON Scroll", e);
}
</script>

<template>
  <n-scrollbar @scroll="onScroll" x-scrollable trigger="hover">
    <!-- <n-button-group>
      <n-button
        size="tiny"
        @click="scrollTo({ position: 'bottom', slient: true })"
      >
        아래로
      </n-button>
      <n-button
        size="tiny"
        @click="scrollTo({ position: 'top', slient: true })"
      >
        맨위로
      </n-button>
    </n-button-group> -->
    <n-space v-for="(txt, idx) in logTxts" :key="idx">
      <n-text strong> {{ txt[0] }} </n-text>
      <n-text italic> {{ txt[1] }} </n-text>
    </n-space>
  </n-scrollbar>
</template>
