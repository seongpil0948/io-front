<script setup lang="ts">
import { useBatchVendorProd, useVendorProdCols } from "@/composable";

const {
  fileModel,
  excelInputRef,
  onBtnClick,
  openPreviewModal,
  parsedGarments,
  onPreviewConfirm,
  onPreviewCancel,
  disableModalSave,
  authStore,
} = useBatchVendorProd({ visible: "GLOBAL" });

const { columns } = useVendorProdCols(false, true);

function handleFileChange(evt: Event) {
  const element = evt.currentTarget as HTMLInputElement;
  fileModel.value = element.files;
  disableModalSave.value = false;
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
    </template>
    <vendor-garment-form
      :minimal="false"
      :virtual="false"
      :vendor-id="authStore.currUser.userInfo.userId"
    />
  </n-card>
</template>
