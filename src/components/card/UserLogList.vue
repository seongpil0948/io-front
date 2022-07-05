<script setup lang="ts">
import { useReadLogger, isObject } from "@/composables";
import { useAuthStore } from "@/stores";
import { computed } from "vue";

const authStore = useAuthStore();

const { userLogs } = useReadLogger({
  uids: [authStore.currUser.userInfo.userId],
  limit: 30,
});

const logTxts = computed(() => {
  const txts: string[][] = [];
  const parseTxts = (ts: { [b: string]: any | string }[]) => {
    const texts: string[] = [];
    ts.forEach((x) => {
      if (typeof x === "string") {
        texts.push(x);
      } else if (isObject(x)) {
        texts.push(JSON.stringify(x).substring(0, 18));
      }
    });
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
    <n-space v-for="(txt, idx) in [...logTxts, ...logTxts]" :key="idx">
      <n-text strong> {{ txt[0] }} </n-text>
      <n-text italic> {{ txt[1] }} </n-text>
    </n-space>
  </n-scrollbar>
</template>
