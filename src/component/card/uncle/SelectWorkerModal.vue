<script setup lang="ts">
import { useUncleWorkers } from "@/composable";
import { IoUser, getUserName } from "@io-boxies/js-lib";
import { useMessage } from "naive-ui";
import { computed, ref, toRefs, watchEffect } from "vue";

const props = defineProps<{
  openModal: boolean;
}>();
const { openModal } = toRefs(props);
const msg = useMessage();
const { workers } = useUncleWorkers();
const emits = defineEmits<{
  (e: "worker:selected", value: IoUser): void;
  (e: "update:openModal", value: boolean): void;
}>();
const showModal = ref(false);
watchEffect(() => {
  showModal.value = openModal.value;
});

const selectedWorker = ref<IoUser | null>(null);
const workerId = ref<string | null>(null);
watchEffect(() => {
  selectedWorker.value =
    workers.value.find((x) => x.userInfo.userId === workerId.value) ?? null;
});

function submit() {
  if (!selectedWorker.value) return msg.error("엉클 근로자를 선택 해주십시오");
  emits("worker:selected", selectedWorker.value);
}
const workerOpt = computed(() =>
  workers.value.map((x) => {
    return { label: getUserName(x), value: x.userInfo.userId };
  })
);
</script>

<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    style="width: 50%"
    title="엉클 근로자 선택"
  >
    <n-select v-model:value="workerId" :options="workerOpt" />
    <template #action>
      <n-space justify="end">
        <n-button @click="submit"> 제출 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
