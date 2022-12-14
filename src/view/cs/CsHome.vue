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
  <n-card>
    <n-space
      v-if="faqCtgrList.length > 0"
      vertical
      align="center"
      justify="space-around"
      item-style="width: 100%"
    >
      <n-space align="center" justify="center">
        <logo-image
          style="margin-top: 30%"
          size="2.0rem"
          @click="router.goHome(auth.currUser)"
        />
        <n-h2 style="margin: auto; text-align: center"> 자주 묻는 질문 </n-h2>
      </n-space>

      <n-space align="center" justify="center" inline>
        <n-button
          v-for="ctgr in faqCtgrList"
          :key="ctgr.value"
          quaternary
          style="width: 3rem; height: 3rem; padding-top: 5%"
          @click="() => goFaqCtgr(ctgr.value, 'FAQ')"
        >
          <n-space vertical align="center" justify="space-around">
            <n-icon :size="20" :component="ctgr.icon" />
            <n-h4> {{ ctgr.showName }} </n-h4>
          </n-space>
        </n-button>
      </n-space>
      <n-button style="width: 16rem; margin-top: 5%" @click="callCsChat">
        1대1 문의
      </n-button>
    </n-space>
  </n-card>

  <cs-post-table :title="postTypeToKo('NOTICE')" :posts="noticePosts" />
  <cs-post-table :title="postTypeToKo('EVENT')" :posts="eventPosts" />
</template>
