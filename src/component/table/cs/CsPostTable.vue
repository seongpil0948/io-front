<template>
  <n-card style="margin: 2% 0%">
    <n-space
      v-if="title && posts.length > 0"
      vertical
      align="center"
      justify="space-around"
      item-style="width: 100%; height: 100%"
    >
      <n-data-table
        :columns="columns(title)"
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
import { NThing, DataTableColumns, NButton } from "naive-ui";
import { h, toRefs } from "vue";
import { useRouter } from "vue-router";
import { useCsStore } from "@/store";
import { loadDate, formatDate } from "@io-boxies/js-lib";

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

const columns = (title: string) =>
  [
    {
      title,
      key: "title",
      minWidth: 200,
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
