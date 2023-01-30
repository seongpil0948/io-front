<script setup lang="ts">
import { shipAreas } from "@/asset/administrationAreas";
import { locateTypeOpt, nameLenRule } from "@/util";
import { LocateType, Locate } from "@io-boxies/js-lib";
import { FormInst, useMessage } from "naive-ui";
import { ref, toRefs } from "vue";
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
const formModel = ref<{ [k in keyof Locate]: Locate[k] }>({
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
      x.city === formModel.value.city &&
      x.county === formModel.value.county &&
      x.town === formModel.value.town
  );
  if (!adminArea) {
    msg.error("주소를 입력 해주십시오");
    return;
  } else if (!formRef.value) {
    return;
  }
  formRef.value.validate((errors) => {
    if (errors) {
      msg.error("올바른 형식의 주소를 입력 해주십시오");
      log.debug(null, errors);
    } else {
      const result: Locate = Object.assign({}, formModel.value, {
        code: adminArea.code,
      });

      log.debug(null, errors, "submitLocate: ", result);
      emits("appendLocate", result);
      emits("update:showAppendModal", false);
    }
  });
}
function updateShow(val: boolean) {
  emits("update:showAppendModal", val);
}
</script>

<template>
  <n-modal
    :show="showAppendModal"
    preset="card"
    title="주소정보추가"
    :mask-closable="false"
    style="width: 85%; height: 80vh"
    @on-update:show="updateShow"
    @esc="() => updateShow(false)"
    @close="() => updateShow(false)"
  >
    <n-form
      ref="formRef"
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
        <n-form-item-gi label="주소" required>
          <area-selector
            v-model:area="formModel"
            style="margin-bottom: 1%; margin-top: 1%"
          />
        </n-form-item-gi>
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
