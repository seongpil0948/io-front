<script setup lang="ts">
import { VendorProd } from "@/composables";
import type { PROD_SIZE, VendorProdCombined } from "@/types";
import { ref, toRefs, watchEffect } from "vue";
const emits = defineEmits(["update:showRegitModal"]);
const props = defineProps<{
  combineProd: VendorProdCombined;
  showRegitModal: boolean;
}>();
const { combineProd: cp } = toRefs(props);

const FormModel = ref<{ [key: string]: any }>(cp.value.stockCnt);
async function onSave(size: string, color: string, stockCnt: number) {
  // FIXME: RegitVendorProd.vue:18 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'white')
  // 상품 저장시 발생.. 다 delete 해버리는건 아닌데
  // onSave 로그 확인하셈
  console.log("Size: ", size, "COLOR:", color, "STOCK_CNT: ", stockCnt);
  const prod = new VendorProd(
    Object.assign(cp.value, {
      size: size as PROD_SIZE,
      color,
      stockCnt,
      vendorProdId: FormModel.value[size as PROD_SIZE][color].prodId,
    })
  );
  await prod.update();
  delete FormModel.value[size][color];
}

watchEffect(() => {
  const sizes = Object.values(FormModel.value);
  if (sizes.every((colorObj) => Object.keys(colorObj).length < 1)) {
    emits("update:showRegitModal", false);
  }
});
</script>

<template>
  <n-modal
    :show="showRegitModal"
    preset="card"
    title="상품 추가정보 입력"
    size="huge"
  >
    <div v-for="(size, i) in Object.keys(FormModel)" :key="i">
      <div v-for="(color, j) in Object.keys(FormModel[size])" :key="j">
        <n-space>
          <n-text>{{ size }}</n-text>
          <n-text>{{ color }}</n-text>
          <n-input-number
            :min="0"
            v-model:value="FormModel[size][color].stockCnt"
          />
          <n-button
            @click="onSave(size, color, FormModel[size][color].stockCnt)"
          >
            저장
          </n-button>
        </n-space>
      </div>
    </div>
  </n-modal>
</template>
