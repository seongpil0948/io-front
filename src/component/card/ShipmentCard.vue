<script setup lang="ts">
import { IoShipment, IoUser, USER_DB } from "@/composable";
// import { useCommonStore } from "@/store";
// import { formatDate, loadDate } from "@io-boxies/js-lib";
import { toRefs, shallowRef, onBeforeMount } from "vue";
// import { storeToRefs } from "pinia";
import { ioFireStore } from "@/plugin/firebase";
const props = defineProps<{
  shipment: IoShipment;
}>();
const { shipment: a } = toRefs(props);
// const cs = useCommonStore();
// const { locale } = storeToRefs(cs);
const uncle = shallowRef<IoUser | null>(null);
const worker = shallowRef<IoUser | null>(null);
onBeforeMount(async () => {
  if (a.value.uncleId) {
    worker.value =
      (await USER_DB.getUserById(ioFireStore, a.value.uncleId)) ?? null;
    uncle.value =
      (await USER_DB.getUserById(ioFireStore, a.value.managerId)) ?? null;
  }
});
</script>
<template>
  <n-card>
    <n-space vertical>
      <n-space>
        <n-text strong>배송방법</n-text>
        <n-text type="info">{{ a.shipMethod }}</n-text>
      </n-space>
      <n-space>
        <n-text strong>사이즈별금액</n-text>
        <n-text type="info">{{ a.amountBySize }}({{ a.sizeUnit }})</n-text>
      </n-space>
      <n-space>
        <n-text strong>중량별금액</n-text>
        <n-text type="info">{{ a.amountByWeight }}({{ a.weightUnit }})</n-text>
      </n-space>
      <n-space>
        <n-text strong>지불여부</n-text>
        <n-text type="info">{{ a.paid }}</n-text>
      </n-space>
      <n-h4>엉클 관리자 정보</n-h4>
      <user-basic-card :user="uncle" />
      <n-h4>엉클 근로자 정보</n-h4>
      <user-basic-card :user="worker" />
      <n-space v-if="a.doneInfo" vertical>
        <n-h4>배송완료정보</n-h4>
        <n-image-group>
          <n-space>
            <n-image
              v-for="(url, i) in a.doneInfo.photos"
              :key="i"
              width="100"
              :src="url"
            />
          </n-space>
        </n-image-group>
        <n-h4>배송완료 메모</n-h4>
        {{ a.doneInfo.memo }}
      </n-space>
    </n-space>
  </n-card>
</template>
