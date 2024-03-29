<script setup lang="ts">
import { VendorGarment, VENDOR_GARMENT_DB } from "@/composable";
import { useAuthStore } from "@/store";
import { nameLenRule, biggerThanNRule, notNullRule, makeMsgOpt } from "@/util";
import { cloneDeep } from "lodash";
import { useMessage, FormInst } from "naive-ui";
import { AddCircleOutline } from "@vicons/ionicons5";
import { ref, watchEffect } from "vue";
import { useEditor } from "@/plugin/editor";
import { insertById, getIoCollection } from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";

const props = defineProps<{
  prod?: VendorGarment;
}>();
const emits = defineEmits(["onSubmitProd"]);
const prod = ref<VendorGarment | null>(null);
watchEffect(() => {
  if (props.prod) {
    prod.value = cloneDeep(props.prod);
  }
});

const msg = useMessage();
const formRef = ref<FormInst | null>(null);
const auth = useAuthStore();
const uid = auth.currUser().userInfo.userId;
const rules = {
  vendorProdName: nameLenRule,
  vendorPrice: biggerThanNRule(999),
  fabric: notNullRule, // 혼용률 / 제조국
  description: notNullRule,
  stockCnt: biggerThanNRule(0),
};

function onEdit() {
  if (!prod.value || !props.prod) return;
  const p = prod.value!;
  formRef.value?.validate(async (errors) => {
    if (errors)
      return msg.error("상품 작성란을 올바르게 작성 해주세요", makeMsgOpt());
    const info = await saveEditor();
    if (info) {
      if (p.visible && p.visible === "ME") {
        await insertById<VendorGarment>(
          p,
          getIoCollection(ioFireStore, { uid, c: "VIRTUAL_VENDOR_PROD" }),
          p.vendorProdId,
          true,
          VendorGarment.fireConverter()
        );
      } else {
        await VENDOR_GARMENT_DB.updateSimilarProd(
          { vendorId: p.vendorId, vendorProdName: props.prod!.vendorProdName },
          {
            info,
            vendorProdName: p.vendorProdName,
            vendorPrice: p.vendorPrice,
            allowPending: p.allowPending,
            titleImgs: p.titleImgs,
            bodyImgs: p.bodyImgs,
          }
        );
      }
    }

    clearEditor();
    msg.success("편집 성공!");
    emits("onSubmitProd");
  });
}

const { saveEditor, clearEditor } = useEditor({
  readOnly: false,
  elementId: "io-editor",
  placeholder: "상품 정보 입력",
  data: prod.value!.info,
});
</script>

<template>
  <n-form
    v-if="prod"
    ref="formRef"
    :model="prod"
    :rules="rules"
    label-placement="left"
    require-mark-placement="right-hanging"
    label-width="auto"
  >
    <n-grid :x-gap="12" cols="6" item-responsive>
      <n-form-item-gi span="6" label="제품명" path="vendorProdName">
        <n-input v-model:value="prod.vendorProdName" />
      </n-form-item-gi>
      <n-form-item-gi span="4" label="도매가" path="vendorPrice">
        <n-input-number
          v-model:value="prod.vendorPrice"
          :min="1000"
          :step="1000"
        >
          <template #prefix> ₩ </template>
          <template #suffix> 원 </template>
        </n-input-number>
      </n-form-item-gi>
      <n-form-item-gi span="2" label="자동미송여부" path="allowPending">
        <logo-checker
          :size="1.6"
          :checked="prod.allowPending"
          @click="prod.allowPending = !prod.allowPending"
        />
      </n-form-item-gi>
      <n-form-item-gi
        span="6"
        :label="`재고수량(${prod.size}, ${prod.color})`"
        :min="1"
        path="stockCnt"
      >
        <n-input-number
          v-model:value="prod.stockCnt"
          :show-button="false"
          :min="1"
        />
      </n-form-item-gi>

      <n-form-item-gi span="6" path="info">
        <!-- <n-input
          v-model:value="prod.info"
          type="textarea"
          placeholder="상품 정보 입력"
        /> -->
        <n-space vertical item-style="width: 100%" style="width: 100%">
          <n-text>상품정보</n-text>
          <div id="io-editor" />
        </n-space>
      </n-form-item-gi>
      <n-form-item-gi span="6" label="상품 요약" path="description">
        <n-input v-model:value="prod.description" placeholder="개요 입력" />
      </n-form-item-gi>
      <n-form-item-gi span="6" label="혼용률/제조국" path="fabric">
        <n-input v-model:value="prod.fabric" placeholder="원단 정보 입력" />
      </n-form-item-gi>
      <n-form-item-gi
        span="6"
        :label="`대표이미지(${prod.titleImgs.length})`"
        path="titleImgs"
      >
        <single-image-input
          v-model:urls="prod.titleImgs"
          element-id="titleImgs"
          size="100"
          :max="1"
          svc="VENDOR_PRODUCT"
          :parent-id="prod.vendorProdId"
          :user-id="uid"
          :role="auth.currUserRole"
        >
          <add-circle-outline style="cursor: pointer" />
        </single-image-input>
      </n-form-item-gi>
      <n-form-item-gi
        span="6"
        :label="`제품이미지(${prod.bodyImgs.length})`"
        path="bodyImgs"
      >
        <single-image-input
          v-model:urls="prod.bodyImgs"
          element-id="bodyImgs"
          size="100"
          :max="20"
          svc="VENDOR_PRODUCT"
          :user-id="uid"
          :role="auth.currUserRole"
        >
          <add-circle-outline style="cursor: pointer" />
        </single-image-input>
      </n-form-item-gi>
    </n-grid>
    <div style="display: flex; justify-content: flex-end">
      <n-button round type="primary" size="large" @click="onEdit">
        상품수정
      </n-button>
    </div>
  </n-form>
</template>
