<template>
  <n-space justify="start">
    <n-button @click="router.replace({ name: 'CsHome' })">
      <template #icon>
        <n-icon>
          <ArrowBack />
        </n-icon>
      </template>
      홈으로
    </n-button>
  </n-space>
  <n-space vertical item-style="width: 100%; height: 100%;">
    <n-h2
      prefix="bar"
      style="
        text-align: start;
        margin-left: 3%;
        margin-bottom: 0.5%;
        margin-top: 3%;
      "
    >
      {{ detailPost?.title }}
    </n-h2>
    <div id="io-editor" style="min-height: 70vh" />
  </n-space>
</template>

<script setup lang="ts">
import { useCsStore } from "@/store";
import { useMessage } from "naive-ui";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { onBeforeUnmount } from "vue";
import { useEditor } from "@/plugin/editor";
import { ArrowBack } from "@vicons/ionicons5";

const csStore = useCsStore();
const router = useRouter();
const msg = useMessage();
const { detailPost } = storeToRefs(csStore);
if (!detailPost.value) {
  msg.error("잘못된 접근 입니다..!");
  router.replace({ name: "CsHome" });
}
useEditor({
  readOnly: true,
  elementId: "io-editor",
  placeholder: "",
  data: detailPost.value ? detailPost.value.content : undefined,
});
onBeforeUnmount(() => {
  csStore.$patch({ detailPost: null });
});
</script>
