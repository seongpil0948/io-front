<template>
  <n-card style="margin: 2.5% 0">
    <n-space
      v-if="posts.length > 0"
      vertical
      align="center"
      justify="space-around"
      item-style="width: 100%; height: 100%"
    >
      <n-h2 v-if="title" style="text-align: start">
        {{ title }}
      </n-h2>
      <n-data-table
        :columns="columns"
        :data="posts"
        :pagination="{ pageSize: 5 }"
        :bordered="false"
      />
    </n-space>
    <n-result
      v-else
      status="error"
      :title="`${title ?? ''} 데이터가 없습니다`"
    />
  </n-card>
</template>

<script setup lang="ts">
import { CsPost } from "@/composable";
import { NButton, DataTableColumns, NText } from "naive-ui";
import { computed, h, toRefs } from "vue";
import { useRouter } from "vue-router";
import { loadDate, formatDate } from "@/util";
import { useCsStore } from "@/store";

const props = defineProps<{
  posts: CsPost[];
  title?: string;
}>();
const { posts, title } = toRefs(props);

const router = useRouter();
const csStore = useCsStore();

function goDetail(detailPost: CsPost) {
  csStore.$patch({ detailPost });
  router.push({ name: "CsDetail" });
}

const columns = computed(
  () =>
    [
      {
        title: "게시일",
        key: "createdAt",
        render: (row: any) =>
          h(
            NText,
            {},
            {
              default: () => {
                return formatDate(loadDate(row.createdAt), "MIN");
              },
            }
          ),
      },
      {
        title: "제목",
        key: "title",
        render: (row) =>
          h(
            NButton,
            {
              onClick: () => goDetail(row),
              text: true,
            },
            { default: () => row.title ?? "" }
          ),
      },
    ] as DataTableColumns<CsPost>
);
</script>
