<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed, getCurrentInstance } from "vue";
import { useAuthStore, useCsStore } from "@/store";
import { storeToRefs } from "pinia";
import { POST_TYPE, postTypeToKo, csChat, FAQ_CATEGORIES } from "@/composable";

const router = useRouter();
const auth = useAuthStore();
const csStore = useCsStore();
const { noticePosts, eventPosts } = storeToRefs(csStore);

const faqCtgrList = computed(() => FAQ_CATEGORIES[auth.currUserRole] ?? []);

function goFaqCtgr(ctgr: string, postType: POST_TYPE) {
  console.log("ctgr:", ctgr);
  router.push({
    name: "FaqByCtgr",
    state: {
      ctgr,
      postType,
    },
  });
}

const inst = getCurrentInstance();
function callCsChat() {
  csChat(inst);
}
</script>

<template>
  <n-card style="margin: 2.5% 0">
    <n-space
      v-if="faqCtgrList.length > 0"
      vertical
      align="center"
      justify="space-around"
    >
      <n-space align="center">
        <logo-image @click="router.goHome(auth.currUser)" size="2.0rem" />
        <n-h2 style="margin: auto; text-align: center"> 자주 묻는 질문 </n-h2>
      </n-space>

      <n-space>
        <n-button
          v-for="ctgr in faqCtgrList"
          :key="ctgr.value"
          quaternary
          @click="() => goFaqCtgr(ctgr.value, 'FAQ')"
          style="width: 8rem; height: 6rem; padding-top: 10%"
        >
          <n-space vertical align="center" justify="space-around">
            <n-icon :size="20" :component="ctgr.icon"> </n-icon>
            <n-h4> {{ ctgr.showName }} </n-h4>
          </n-space>
        </n-button>
      </n-space>
      <n-button @click="callCsChat" style="width: 16rem; margin-top: 5%"
        >1대1 문의</n-button
      >
    </n-space>
  </n-card>

  <cs-post-table :title="postTypeToKo('NOTICE')" :posts="noticePosts" />
  <cs-post-table :title="postTypeToKo('EVENT')" :posts="eventPosts" />
</template>
