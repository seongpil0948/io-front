<script setup lang="ts">
import { VendorGarment } from "@/composable";
import { useAuthStore } from "@/store";
import {
  nameLenRule,
  biggerThanNRule,
  arrLenRule,
  notNullRule,
  makeMsgOpt,
} from "@/util";
import { cloneDeep } from "lodash";
import { useMessage, FormInst } from "naive-ui";
import { AddCircleOutline } from "@vicons/ionicons5";
import { ref, watchEffect } from "vue";

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

const rules = {
  vendorProdName: nameLenRule,
  vendorPrice: biggerThanNRule(999),
  titleImgs: arrLenRule(1),
  bodyImgs: arrLenRule(1),
  fabric: notNullRule, // 혼용률 / 제조국
  info: notNullRule, // 상세정보
  description: notNullRule,
  stockCnt: biggerThanNRule(0),
};

function onEdit() {
  if (!prod.value) return;
  formRef.value?.validate(async (errors) => {
    if (errors)
      return msg.error("상품 작성란을 올바르게 작성 해주세요", makeMsgOpt());

    await prod.value!.update();
    emits("onSubmitProd");
  });
}
const auth = useAuthStore();
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
          :min="1000"
          :step="1000"
          v-model:value="prod.vendorPrice"
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
          :show-button="false"
          :min="1"
          v-model:value="prod.stockCnt"
        />
      </n-form-item-gi>

      <n-form-item-gi span="6" label="상품정보" path="info">
        <n-input
          v-model:value="prod.info"
          type="textarea"
          placeholder="상품 정보 입력"
        />
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
          elementId="titleImgs"
          :user="auth.currUser"
          size="100"
          v-model:urls="prod.titleImgs"
          :max="5"
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
          elementId="bodyImgs"
          :user="auth.currUser"
          v-model:urls="prod.bodyImgs"
          size="100"
          :max="5"
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
