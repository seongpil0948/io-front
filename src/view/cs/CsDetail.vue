<template>
  <n-space
    vertical
    item-style="width: 100%; height: 100%; margin-left: 1.5%; margin-right: 1.5%;"
  >
    <n-space justify="start" style="margin-top: 3%">
      <n-button @click="() => router.replace({ name: 'CsHome' })">
        <template #icon>
          <n-icon>
            <ArrowBack />
          </n-icon>
        </template>
        홈으로
      </n-button>
    </n-space>
    <n-card style="text-align: start; margin-bottom: 0.5%">
      <n-h2 prefix="bar">
        {{ detailPost?.title }}
      </n-h2>
      <div id="io-editor" style="min-height: 70vh" />
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { useCsStore } from "@/store";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { onBeforeUnmount, onBeforeMount, watch } from "vue";
import { useEditor } from "@/plugin/editor";
import { ArrowBack } from "@vicons/ionicons5";

const csStore = useCsStore();
const router = useRouter();
const postNo = router.currentRoute.value.params.no;
const { detailPost, posts, initial } = storeToRefs(csStore);

const { render, editor } = useEditor({
  readOnly: true,
  elementId: "io-editor",
  placeholder: "",
  data: detailPost.value ? detailPost.value.content : undefined,
});

onBeforeMount(async () => {
  if (postNo.length < 1 || typeof postNo !== "string") {
    console.error("잘못된 접근");
    return router.back();
  } else if (detailPost && detailPost.value && detailPost.value.no === postNo) {
    console.log("detailPost: ", detailPost.value);
    return;
  } else if (initial.value) {
    await csStore.init();
  }
  const post = posts.value.find((x) => postNo === x.no);
  if (!post) {
    console.error("미존재/허가 되지 않은 컨텐츠");
    return router.back();
  }
  detailPost.value = post!;
  csStore.$patch({ detailPost: post });
});
watch(
  () => detailPost.value,
  async (val) => {
    if (val && val.content && editor.value) {
      await render(val.content);
    }
  }
);

onBeforeUnmount(() => {
  csStore.$patch({ detailPost: null });
});
</script>
