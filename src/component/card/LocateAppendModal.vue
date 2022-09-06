<script setup lang="ts">
import { shipAreas } from "@/asset/administrationAreas";
import { Locate, LocateCRT, LocateType } from "@/composable";
import { locateTypeOpt, nameLenRule } from "@/util";
import { FormInst, useMessage } from "naive-ui";
import { reactive, ref, toRefs, watchEffect } from "vue";
import { useLogger } from "vue-logger-plugin";

const log = useLogger();
const props = defineProps<{
  showAppendModal: boolean;
}>();
const { showAppendModal } = toRefs(props);
const emits = defineEmits<{
  (e: "appendLocate", value: Locate): void;
  (e: "update:showAppendModal", value: boolean): void;
}>();

const msg = useMessage();
const formRef = ref<FormInst | null>(null);
const formModel = reactive<{ [k in keyof LocateCRT]: LocateCRT[k] }>({
  locateType: locateTypeOpt.value[0].value as LocateType,
  alias: "",
  city: undefined,
  county: undefined,
  town: undefined,
  postalCode: undefined,
  detailLocate: undefined,
  firstName: undefined,
  lastName: undefined,
  phone: undefined,
  country: "KO",
  latitude: undefined,
  longitude: undefined,
});
const rule = {
  alias: nameLenRule,
  detailLocate: nameLenRule,
  firstName: nameLenRule,
  lastName: nameLenRule,
  phone: nameLenRule,
  postalCode: nameLenRule,
  country: nameLenRule,
  city: nameLenRule,
  county: nameLenRule,
  town: nameLenRule,
  locateType: nameLenRule,
};
function submitLocate() {
  const adminArea = shipAreas.find(
    (x) =>
      x.city === formModel.city &&
      x.county === formModel.county &&
      x.town === formModel.town
  );
  if (!adminArea) {
    msg.error("행정구역을 입력 해주십시오");
    return;
  } else if (!formRef.value) {
    return;
  }
  formRef.value.validate((errors) => {
    if (errors) {
      msg.error("올바른 형식의 주소를 입력 해주십시오");
      log.debug(null, errors);
    } else {
      const result = new Locate(
        Object.assign({}, formModel, { code: adminArea.code })
      );

      log.debug(null, errors, "submitLocate: ", result);
      emits("appendLocate", result);
      emits("update:showAppendModal", false);
    }
  });
}
function updateShow(val: boolean) {
  console.log("updateShow", val);
  emits("update:showAppendModal", val);
}
</script>

<template>
  <n-modal
    :show="showAppendModal"
    @esc="() => updateShow(false)"
    @close="() => updateShow(false)"
    preset="card"
    style="width: 50%"
    title="주소정보추가"
  >
    <n-form
      ref="formRef"
      style="width: 60%"
      inline
      :label-width="80"
      label-placement="top"
      :model="formModel"
      :rules="rule"
      size="medium"
    >
      <n-grid cols="1">
        <n-form-item-gi label="주소 타입" path="locateType">
          <n-select
            v-model:value="formModel.locateType"
            :options="locateTypeOpt"
          />
        </n-form-item-gi>

        <n-form-item-gi label="별칭" path="alias">
          <n-input v-model:value="formModel.alias" placeholder="별칭 입력" />
        </n-form-item-gi>
        <n-form-item-gi label="행정구역">
          <area-selector
            style="margin-bottom: 1%; margin-top: 1%"
            v-model:area="formModel"
          />
        </n-form-item-gi>
        <!-- <n-form-item-gi label="도시" path="city">
          <n-input v-model:value="formModel.city" placeholder="도시 입력" />
        </n-form-item-gi>
        <n-form-item-gi label="구" path="county">
          <n-input v-model:value="formModel.county" placeholder="구 입력" />
        </n-form-item-gi>
        <n-form-item-gi label="동" path="town">
          <n-input v-model:value="formModel.town" placeholder="동 입력" />
        </n-form-item-gi> -->

        <n-form-item-gi label="우편번호" path="postalCode">
          <n-input
            v-model:value="formModel.postalCode"
            placeholder="우편번호"
          />
        </n-form-item-gi>
        <n-form-item-gi label="상세주소" path="detailLocate">
          <n-input
            v-model:value="formModel.detailLocate"
            placeholder="상세주소 입력"
          />
        </n-form-item-gi>
        <n-form-item-gi label="받는분 성함(성)" path="firstName">
          <n-input v-model:value="formModel.firstName" placeholder="성 입력" />
        </n-form-item-gi>
        <n-form-item-gi label="받는분 성함(이름)" path="lastName">
          <n-input v-model:value="formModel.lastName" placeholder="이름 입력" />
        </n-form-item-gi>
        <n-form-item-gi label="연락처" path="phone">
          <n-input v-model:value="formModel.phone" placeholder="연락처 입력" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #action>
      <n-space justify="end">
        <n-button @click="submitLocate"> 제출 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
