<script setup lang="ts">
import { useCsStore, useAuthStore } from "@/store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { computed, ref } from "vue";
import { FAQ_CATEGORIES, postTypeToKo } from "@/composable";
import { ArrowBack } from "@vicons/ionicons5";

const router = useRouter();
const csStore = useCsStore();
const { searchInputVal } = storeToRefs(csStore);
const auth = useAuthStore();
const faqCtgrList = computed(() => FAQ_CATEGORIES[auth.currUserRole] ?? []);

const state = window.history.state;
if (!state.ctgr || !state.postType) {
  console.error("유효하지 않은 FAQ 카테고리");
  router.back();
}
const { faqByCtgr } = storeToRefs(csStore);
const currPostType = ref(state.ctgr);
</script>
<template>
  <n-space
    vertical
    justify="space-around"
    item-style="width: 100%; height: 100%"
    style="margin-top: 1%"
  >
    <n-space justify="start">
      <n-button @click="() => router.replace({ name: 'CsHome' })">
        <template #icon>
          <n-icon>
            <ArrowBack />
          </n-icon>
        </template>
        홈으로
      </n-button>
    </n-space>
    <n-card>
      <n-tabs v-model:value="currPostType">
        <template #suffix>
          <n-input v-model:value="searchInputVal" placeholder="상품검색" />
          <n-button @click="() => csStore.search"> 검색 </n-button>
        </template>
        <n-tab-pane
          v-for="(ctgr, i) in faqCtgrList"
          :key="i"
          display-directive="show:lazy"
          :tab="ctgr.showName"
          :name="ctgr.value"
        >
          <cs-post-table
            :title="postTypeToKo('FAQ')"
            :posts="faqByCtgr[ctgr.value] ?? []"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-space>
</template>
