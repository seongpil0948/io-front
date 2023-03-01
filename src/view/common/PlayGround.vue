<script setup lang="ts">
import { CSSProperties, ref } from "vue";
const overlayStyle = ref<CSSProperties>({
  display: "none",
  zIndex: 999,
  position: "fixed",
  width: "100%",
  height: "100%",
  left: 0,
  top: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  overflowX: "hidden",
});
function goTutorial() {
  const el = document.querySelector("[data-tu='process-one']");
  el?.classList.add("focus-target");
  overlayStyle.value.display = "block";
}
function closeTutorial() {
  const el = document.querySelector("[data-tu='process-one']");
  el?.classList.remove("focus-target");
  overlayStyle.value.display = "none";
}
</script>

<template>
  <n-space vertical justify="center" align="center">
    <n-h1>Play Ground</n-h1>
    <n-button @click="goTutorial">how to?</n-button>
    <n-button data-tu="process-one" @click="closeTutorial">goProcess</n-button>
    <div :style="overlayStyle" />
  </n-space>
</template>

<style scoped>
.focus-target {
  /* animation properties */
  animation-name: my-animation;
  animation-duration: 2s;
  animation-iteration-count: 3;
  animation-timing-function: linear;
  z-index: 10000;
  display: block;
  background-color: white;
}

@keyframes my-animation {
  0% {
    transform: scale(100%);
  }
  50% {
    transform: scale(120%);
  }
  100% {
    transform: scale(100%);
  }
}
</style>
