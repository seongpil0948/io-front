<script lang="ts">
// normal `<script>`, executed in module scope (only once)
export default {
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import { IoPay, IO_PAY_DB } from "@/composable";
import { toRefs, watch } from "vue";

const props = defineProps<{
  showModal: boolean;
  userId: string;
  expectedReduceCoin: number;
  userPay: IoPay | null;
}>();
const { showModal, userPay } = toRefs(props);
const emits = defineEmits(["update:showModal", "onConfirm"]);

watch(
  () => userPay.value,
  async (val) => {
    if (val === null) {
      val = await IO_PAY_DB.getIoPayByUser(props.userId);
    }
  }
);

function onConfirmClick() {
  emits("onConfirm");
}
function onCancelClick() {
  emits("update:showModal", false);
}
</script>
<template>
  <n-modal
    display-directive="show"
    :show="showModal"
    close-on-esc
    @esc="onCancelClick"
    preset="card"
    style="width: 50vw"
  >
    <template #default>
      <n-space vertical justify="center" style="text-align: center">
        <n-h2><slot name="title"></slot></n-h2>
        <n-h2><slot></slot></n-h2>
      </n-space>
    </template>

    <template #footer>
      <n-space justify="center" style="font-size: 1.2rem">
        <n-text>(예상 소모 코인: {{ expectedReduceCoin }})</n-text>
        <n-text v-if="userPay">사용가능 코인 {{ userPay.availBudget }}</n-text>
      </n-space>
    </template>
    <template #action>
      <n-space justify="center" style="gap: 3vw">
        <n-button text @click="onConfirmClick">
          <n-h2 class="under-bar">승인</n-h2>
        </n-button>
        <n-button text @click="onCancelClick">
          <n-h2 class="under-bar">취소</n-h2>
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
