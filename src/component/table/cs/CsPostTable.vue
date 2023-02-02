<template>
  <n-data-table
    v-if="title && posts.length > 0"
    :columns="columns(title)"
    :data="showPosts"
    :pagination="{ pageSize: 5 }"
    :bordered="false"
  />
  <n-result v-else status="error" :title="`${title ?? ''} 데이터가 없습니다`" />
</template>

<script setup lang="ts">
import { CsPost } from "@/composable";
import { NThing, DataTableColumns, NButton } from "naive-ui";
import { h, toRefs, computed } from "vue";
import { useRouter } from "vue-router";
import { useCsStore } from "@/store";
import { loadDate, formatDate } from "@io-boxies/js-lib";
import { storeToRefs } from "pinia";

const props = defineProps<{
  posts: CsPost[];
  title?: string;
}>();
const { posts, title } = toRefs(props);

const router = useRouter();
const csStore = useCsStore();
const { validIds } = storeToRefs(csStore);

const showPosts = computed(() =>
  validIds.value.length > 0
    ? posts.value.filter((p) => validIds.value.includes(p.no))
    : posts.value
);
function goDetail(detailPost: CsPost) {
  csStore.$patch({ detailPost });
  router.push({ name: "CsDetail" });
}

const columns = (title: string) =>
  [
    {
      title,
      key: "title",
      minWidth: 100,
      ellipsis: {
        tooltip: true,
      },
      render: (row) =>
        h(
          NThing,
          {
            description: formatDate(loadDate(row.createdAt), "MIN"),
          },
          {
            header: () =>
              h(
                NButton,
                {
                  onClick: () => goDetail(row),
                  text: true,
                },
                { default: () => row.title ?? "" }
              ),
          }
        ),
    },
  ] as DataTableColumns<CsPost>;
</script>
