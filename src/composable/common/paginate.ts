import { ref, Ref, computed } from "vue";

interface IoPageParam<T> {
  cntByPage?: number;
  initPage?: number;
  data: Ref<T[]>;
}

export function usePaginate<T>(p: IoPageParam<T>) {
  const page = ref(p.initPage ?? 1);
  const cntByPage = ref(p.cntByPage ?? 10);

  const paginatedData = computed(() =>
    p.data.value.slice(
      (page.value - 1) * cntByPage.value,
      page.value * cntByPage.value
    )
  );
  const totalPage = computed(() =>
    Math.ceil(p.data.value.length / cntByPage.value)
  );

  return { totalPage, paginatedData, page, cntByPage };
}