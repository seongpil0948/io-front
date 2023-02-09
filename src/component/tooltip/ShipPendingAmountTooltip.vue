<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-text strong :type="type">
        {{ activatorTxt ?? "배송 보류금액" }}</n-text
      >
    </template>
    픽업비용과 별개로 픽업 후 결정될 배송비용을 위한 보류 금액. 소매처로부터
    픽업요청이 들어왔을때 아래 설정금액 만큼 보류금액으로 확보후, 배송 완료시
    하단 금액 범위 내에서 지갑에 넣으실 수 있습니다.
  </n-tooltip>
</template>

<script setup lang="ts">
import { NText } from "naive-ui";
defineProps<{
  activatorTxt?: string;
  type?: "default" | "success" | "info" | "warning" | "error";
}>();
</script>
