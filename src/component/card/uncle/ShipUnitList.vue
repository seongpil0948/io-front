<script setup lang="ts">
import { IoUser, useShipUnitCols } from "@/composable";
import { strLenRule } from "@/util";
import { NButton, FormInst, useMessage } from "naive-ui";
import { computed, ref, toRefs } from "vue";
import { useLogger } from "vue-logger-plugin";

const logger = useLogger();
const props = defineProps<{
  unitKey: "amountBySize" | "amountByWeight";
  edit: boolean;
  u: IoUser;
}>();
const { u } = toRefs(props);
if (!u.value.uncleInfo) {
  const err = `${u.value.userInfo.userId} ${u.value.name}, uncleInfo field is undefined in ShipUnitList`;
  logger.error(u.value.userInfo.userId, err);
}

const target = u.value.uncleInfo![props.unitKey];
const showModal = ref(false);
const message = useMessage();
const { shipUnitCols } = useShipUnitCols(
  showModal,
  props.unitKey,
  props.edit,
  u.value
);
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
      await u.value.update();
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
