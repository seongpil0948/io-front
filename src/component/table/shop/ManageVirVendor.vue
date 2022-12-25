<script setup lang="ts">
import { locateToStr, IoUser } from "@io-boxies/js-lib";
import { h, ref, toRefs } from "vue";
import { NText, NButton, NCard, NModal } from "naive-ui";

const props = defineProps<{
  virtualVendors: IoUser[];
}>();
const { virtualVendors } = toRefs(props);

const virVendorCols = [
  {
    title: "이름",
    key: "userInfo.displayName",
  },
  {
    title: "연락처",
    key: "userInfo.phone",
  },
  {
    title: "주소",
    key: "locate",
    render: (r: IoUser) =>
      h(
        NText,
        {},
        {
          default: () =>
            r.companyInfo?.shipLocate
              ? locateToStr(r.companyInfo?.shipLocate)
              : "X",
        }
      ),
  },
];

const showRegitVendor = ref(false);
</script>

<template>
  <n-card style="width: 100%">
    <template #header> 가상 도매처 관리 </template>
    <template #header-extra>
      <n-button @click="showRegitVendor = true"> 가상 도매처 추가 </n-button>
    </template>

    <n-data-table
      :columns="virVendorCols"
      :data="virtualVendors"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <n-modal v-model:show="showRegitVendor" style="margin: 0 5%">
    <n-card role="dialog" aria-modal="true">
      <virtual-vendor-form @submit-virtual-vendor="showRegitVendor = false" />
    </n-card>
  </n-modal>
</template>
