<script setup lang="ts">
import { WorkerInfo, FormOfEmployee } from "@io-boxies/js-lib";
import { ref, computed } from "vue";
import { makeMsgOpt, nameLenRule, notNullRule, arrLenRule } from "@/util";
import { type FormInst, useMessage } from "naive-ui";
import { useAuthStore } from "@/store";
import { AddCircleOutline } from "@vicons/ionicons5";
const formRef = ref<FormInst | null>(null);
const workerInfo = ref({
  areaInCharges: [],
  formOfEmp: "FULL_TIME" as FormOfEmployee,
  payday: 1,
  empContract: [],
});
const emits = defineEmits<{
  (e: "submit:workerInfo", value: WorkerInfo): void;
}>();
const authStore = useAuthStore();
const u = authStore.currUser;

const msg = useMessage();
async function onSubmit(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (errors) return msg.error("올바르게 작성 해주세요", makeMsgOpt());
    emits("submit:workerInfo", workerInfo.value);
  });
}

function formOfEmpToKo(b: FormOfEmployee) {
  switch (b) {
    case "PART_TIME":
      return "파트타임";
    case "FULL_TIME":
      return "풀타임";
  }
}
const formOfEmpOpts = computed(() =>
  Object.values(FormOfEmployee).map((x) => {
    return { label: formOfEmpToKo(x), value: x };
  })
);

const rules = {
  formOfEmp: nameLenRule,
  payday: notNullRule,
  empContract: arrLenRule(1),
};
</script>
<template>
  <n-form
    ref="formRef"
    :model="workerInfo"
    :rules="rules"
    label-placement="left"
    require-mark-placement="right-hanging"
    label-width="auto"
  >
    <n-form-item label="근로형태" path="bank">
      <n-select
        v-model:value="workerInfo.formOfEmp"
        placeholder="근로형태 선택"
        :options="formOfEmpOpts"
      />
    </n-form-item>

    <n-form-item label="급여일" path="payday">
      <n-input-number v-model:value="workerInfo.payday" :min="1" :max="31" />
    </n-form-item>
    <n-form-item label="근로계약서" path="payday">
      <single-image-input
        v-model:urls="workerInfo.empContract"
        svc="USER"
        element-id="empContract"
        :user-id="u.userInfo.userId"
        size="100"
        :max="3"
      >
        <add-circle-outline style="cursor: pointer" />
      </single-image-input>
    </n-form-item>
    <n-button @click="onSubmit"> 근로자 정보 제출 </n-button>
  </n-form>
</template>
