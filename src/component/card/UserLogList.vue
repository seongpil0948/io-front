<script setup lang="ts">
import { IoLog, useReadLogger } from "@/plugin/logger";
import { useAuthStore } from "@/store";
import { isObject, timeToDate } from "@/util";
import { computed, Ref } from "vue";
const authStore = useAuthStore();

const { userLogs: errLogs } = useReadLogger({
  uids: [authStore.currUser.userInfo.userId],
  limit: 30,
  severity: ["error"],
});
const { userLogs: infoLogs } = useReadLogger({
  uids: [authStore.currUser.userInfo.userId],
  limit: 30,
  severity: ["info"],
});
const getLogs = (l: Ref<IoLog[]>) =>
  computed(() => {
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
    l.value.forEach((x) => {
      txts.push([
        `[${timeToDate(x.createdAt, "MIN")}]`,
        `${parseTxts(x.txts)} `,
      ]);
    });
    return txts;
  });
const errorLogRef = getLogs(errLogs);
const infoLogRef = getLogs(infoLogs);
</script>

<template>
  <n-tabs
    size="small"
    type="line"
    animated
    pane-style="overflow: auto; height: 40vh"
  >
    <n-tab-pane name="info" tab="활동로그">
      <div style="margin-top: 10px" v-for="(txt, idx) in infoLogRef" :key="idx">
        <n-h6 style="margin: 0; font-size: 0.8rem"> {{ txt[0] }} </n-h6>
        <n-p style="margin-top: 0; text-indent: 2vw !important">
          {{ txt[1] }}
        </n-p>
      </div>
    </n-tab-pane>
    <n-tab-pane name="error" tab="에러로그">
      <div
        style="margin-top: 10px"
        v-for="(txt, idx) in errorLogRef"
        :key="idx"
      >
        <n-h6 style="margin: 0; font-size: 0.8rem"> {{ txt[0] }} </n-h6>
        <n-p style="margin-top: 0; text-indent: 2vw !important">
          {{ txt[1] }}
        </n-p>
      </div>
    </n-tab-pane>
  </n-tabs>
</template>
