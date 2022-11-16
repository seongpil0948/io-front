<script setup lang="ts">
import { useCsStore } from "@/store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { ArrowForward } from "@vicons/ionicons5";

const router = useRouter();
function goCsHome() {
  router.replace({ name: "CsHome" });
}
const csStore = useCsStore();
const { faqPosts, noticePosts } = storeToRefs(csStore);
</script>
<template>
  <n-card>
    <n-tabs>
      <template #suffix>
        <n-button text icon-placement="right" @click="goCsHome">
          더보기
          <template #icon>
            <n-icon>
              <ArrowForward />
            </n-icon>
          </template>
        </n-button>
      </template>
      <n-tab-pane display-directive="show:lazy" tab="공지사항" name="notice">
        <cs-post-table :posts="noticePosts" />
      </n-tab-pane>
      <n-tab-pane display-directive="show:lazy" tab="사용tip" name="faq">
        <cs-post-table :posts="faqPosts" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
