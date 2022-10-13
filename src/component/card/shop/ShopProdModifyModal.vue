<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    style="width: 50%"
    title="상품 정보 수정"
    :bordered="false"
    :segmented="segmented"
  >
    <n-form
      ref="formRef"
      v-if="userProd"
      :model="formModel"
      :rules="rules"
      label-placement="left"
      require-mark-placement="right-hanging"
      label-width="auto"
    >
      <n-form-item label="제품명" path="name">
        <n-input v-model:value="formModel.prodName" />
      </n-form-item>
      <n-form-item label="도매가" path="vendorPrice">
        <n-input-number
          :step="1000"
          style="width: 100%"
          v-model:value="formModel.prodPrice"
        >
          <template #prefix> ₩ </template>
          <template #suffix> 원 </template>
        </n-input-number>
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="onSubmit">제출</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ShopGarment, ShopUserGarment } from "@/composable";
import { makeMsgOpt, notNullRule, nameLenRule } from "@/util";
import { type FormInst, useMessage } from "naive-ui";
import { ref, toRefs, watchEffect } from "vue";
const emits = defineEmits(["onClose", "update:userProd"]);

const props = defineProps<{
  userProd: ShopUserGarment;
}>();
const { userProd } = toRefs(props);
const formRef = ref<FormInst | null>(null);
const formModel = ref({
  prodPrice: 0,
  prodName: "",
});
const msg = useMessage();
const showModal = ref(false);
watchEffect(() => {
  formModel.value.prodName =
    userProd.value && userProd.value && userProd.value.prodName
      ? userProd.value.prodName
      : formModel.value.prodName;
  formModel.value.prodPrice =
    userProd.value && userProd.value && userProd.value.prodPrice
      ? userProd.value.prodPrice
      : formModel.value.prodPrice;
});
watchEffect(() => (showModal.value = userProd?.value !== null));
watchEffect(() => {
  if (!showModal.value) {
    emits("onClose");
  }
});

async function onSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("상품 작성란을 작성 해주세요", makeMsgOpt());
    if (userProd.value && userProd.value) {
      userProd.value.prodName = formModel.value.prodName;
      userProd.value.prodPrice = formModel.value.prodPrice;
      const shopProd = new ShopGarment(
        Object.assign({}, userProd.value, {
          prodName: formModel.value.prodName,
          prodPrice: formModel.value.prodPrice,
        })
      );
      await shopProd.update();
      emits("update:userProd", shopProd);
      showModal.value = false;
    }
  });
}
const rules = {
  prodPrice: notNullRule,
  prodName: nameLenRule,
};
const segmented = {
  content: "soft",
  footer: "soft",
};
</script>
