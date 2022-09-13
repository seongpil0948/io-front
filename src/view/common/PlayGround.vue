<script setup lang="ts">
import { ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { darkTheme } from "naive-ui";

import { useAuthStore } from "@/store";
console.log("darkThemeOver: ", darkTheme);
// >>> log >>>
const log = useLogger();
const testObject = {
  name: "test",
  value: "this is a test object",
};
const auth = useAuthStore();
const authModel = auth.user;

async function updateUser() {
  console.log("update", authModel);
  await authModel?.update();
}
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
// >>> area >>>
const selectedArea = ref({
  city: null,
  county: null,
  town: null,
});
</script>
<template>
  <n-h1>Play Ground</n-h1>
  <n-card style="color: gray; background-color: gray">
    <n-space justify="space-around">
      <n-button @click="logging">Log Click</n-button>
      <n-button @click="userActLog">User Log Click</n-button>
    </n-space>
    <area-selector v-model:area="selectedArea" />
    <user-locate-list
      v-if="authModel && authModel.companyInfo"
      v-model:info="authModel.companyInfo"
      @update:info="updateUser"
    />
  </n-card>
</template>
