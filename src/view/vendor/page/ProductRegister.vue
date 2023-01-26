<script setup lang="ts">
import { useBatchVendorProd, useVendorProdCols } from "@/composable";

const {
  excelInputRef,
  onBtnClick,
  openPreviewModal,
  parsedGarments,
  onPreviewConfirm,
  onPreviewCancel,
  disableModalSave,
  authStore,
  handleFileChange,
} = useBatchVendorProd({ visible: "GLOBAL" });

const { columns } = useVendorProdCols(false, true);

function downSampleXlsx() {
  const a = document.createElement("a");
  // a.href = url
  a.href = "/example/sample-batch-vendor-prod.xlsx";
  a.download = "sample-batch-vendor-prod.xlsx";
  a.click();
  a.remove();
}
</script>
<template>
  <n-modal
    :show="openPreviewModal"
    :on-update:show="onPreviewCancel"
    :mask-closable="false"
    close-on-esc
    preset="card"
    style="width: 80vw"
  >
    <template #header>
      엑셀 파싱 결과 ({{ parsedGarments.length }} 건)
    </template>
    <template #header-extra>
      <n-button :disabled="disableModalSave" @click="onPreviewConfirm">
        저장
      </n-button>
    </template>

    <n-data-table
      :scroll-x="1200"
      :columns="columns"
      :data="parsedGarments"
      :pagination="{
        showSizePicker: true,
        pageSizes: [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-modal>
  <n-card v-if="authStore.currUser" title="도매 상품 등록">
    <template #header-extra>
      <n-button @click="onBtnClick">
        <input
          id="customFile"
          ref="excelInputRef"
          style="display: none"
          type="file"
          @change="handleFileChange"
        />
        엑셀 일괄 등록
      </n-button>
      <n-button type="primary" @click="downSampleXlsx">
        일괄등록 엑셀양식
      </n-button>
    </template>
    <vendor-garment-form
      :minimal="false"
      :virtual="false"
      :vendor-id="authStore.currUser.userInfo.userId"
    />
  </n-card>
</template>
