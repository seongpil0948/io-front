<script setup lang="ts">
import { onMounted } from "vue";
import { useLogger } from "vue-logger-plugin";

const log = useLogger();
function logging() {
  const testObject = {
    name: "test",
    value: "this is a test object",
  };
  log.debug(null, "Test debug Message", testObject);
  log.info(null, "Test info Message", testObject);
  log.warn(null, "Test warn Message", testObject);
  log.error(null, "Test error Message", testObject);
  log.log(null, "Test Log Message", testObject);
}
function userActLog() {
  const testObject = {
    name: "testUser Act",
    value: "this is a test user Act",
  };
  log.debug("2285273867", "Test debug Message", testObject);
  log.info("2285273867", "Test info Message", testObject);
  log.warn("2285273867", "Test warn Message", testObject);
  log.error("2285273867", "Test error Message", testObject);
}
onMounted(() => {
  log.debug("HIHIHIHI");
});
</script>
<template>
  <n-h1>Play Ground</n-h1>
  <n-button @click="logging">Log Click</n-button>
  <n-button @click="userActLog">User Log Click</n-button>
</template>
