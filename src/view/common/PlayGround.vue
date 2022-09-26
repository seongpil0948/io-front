<script setup lang="ts">
import { useLogger } from "vue-logger-plugin";
import { darkTheme } from "naive-ui";

console.log("darkThemeOver: ", darkTheme);
// >>> log >>>
const log = useLogger();
const testObject = {
  name: "test",
  value: "this is a test object",
};

function logging() {
  log.debug(null, "Test debug Message", testObject);
  log.info(null, "Test info Message", testObject);
  log.warn(null, "Test warn Message", testObject);
  log.error(null, "Test error Message", testObject);
}
function userActLog() {
  log.debug("2285273867", "Test debug Message", testObject);
  log.info("2285273867", "Test info Message", testObject);
  log.warn("2285273867", "Test warn Message", testObject);
  log.error("2285273867", "Test error Message", testObject);
}
// <<< log <<<
</script>
<template>
  <n-h1>Play Ground</n-h1>
  <n-card style="color: gray; background-color: gray">
    <n-space justify="space-around">
      <n-button @click="logging">Log Click</n-button>
      <n-button @click="userActLog">User Log Click</n-button>
    </n-space>
  </n-card>
</template>
