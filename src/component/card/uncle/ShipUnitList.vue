<script setup lang="ts">
import { useShipUnitCols } from "@/composable";
import { useAuthStore } from "@/store";
import { strLenRule } from "@/util";
import { NButton, FormInst, useMessage } from "naive-ui";
import { computed, ref } from "vue";
const props = defineProps<{
  unitKey: "amountBySize" | "amountByWeight";
}>();
const auth = useAuthStore();
const u = auth.currUser;
const target = u.uncleInfo![props.unitKey];
const showModal = ref(false);
const message = useMessage();
const { shipUnitCols } = useShipUnitCols(showModal, props.unitKey);
const data = computed(() =>
  Object.keys(target).map((k) => {
    return { unit: k, amount: target[k] };
  })
);

async function onAdd() {
  await formRef.value?.validate(async (errors) => {
    if (!errors) {
      const val = formValue.value;
      target[val.unit] = val.amount;
      await u.update();
      message.success("추가완료 ");
      showModal.value = false;
    } else {
      message.error("입력값을 올바르게 입력해주세요.");
    }
  });
}
const formRef = ref<FormInst | null>(null);
const formValue = ref({
  unit: "",
  amount: 1000,
});
const rule = {
  unit: strLenRule(1),
};
</script>
<template>
  <n-data-table
    :columns="shipUnitCols"
    :data="data"
    :pagination="{ pageSize: 5 }"
  />
  <n-modal
    v-model:show="showModal"
    preset="card"
    style="width: 50vw"
    title="단위요금 등록"
    :bordered="false"
  >
    <n-form
      ref="formRef"
      inline
      :label-width="80"
      :model="formValue"
      :rules="rule"
    >
      <n-form-item label="단위" path="unit">
        <n-input v-model:value="formValue.unit" placeholder="단위종류 입력" />
      </n-form-item>
      <n-form-item label="단위당 금액" path="amount">
        <n-input-number
          v-model:value="formValue.amount"
          :step="100"
          placeholder="단위당 금액 입력"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="onAdd">추가</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
