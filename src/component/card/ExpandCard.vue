<script setup lang="ts">
// import { Close } from "@vicons/carbon";
import { ExpandOutline, CloseOutline } from "@vicons/ionicons5";
import { ref } from "vue";

const emits = defineEmits<{
  (e: "clickClose", value: boolean): void;
}>();
function clickCloseBtn() {
  emits("clickClose", true);
}
const expanded = ref(false);
</script>
<template>
  <n-card
    :bordered="false"
    :content-style="`
    max-height: ${expanded ? '70vh' : '40vh'};
    width: ${expanded ? '70vw' : '40vw'};
    overflow: auto;
    `"
    style="padding-bottom: 5%"
    header-style="
        padding: 0; text-align: end; border-bottom: lightgray 1px solid;
        padding-bottom: 7px; padding-right: 10px; margin-bottom: 10px;"
  >
    <slot />
    <template #header>
      <n-space justify="end" align="center">
        <n-button quaternary circle @click="expanded = !expanded">
          <template #icon>
            <n-icon size="20">
              <ExpandOutline />
            </n-icon>
          </template>
        </n-button>
        <n-button quaternary circle @click="clickCloseBtn">
          <template #icon>
            <n-icon size="20">
              <CloseOutline />
            </n-icon>
          </template>
        </n-button>
        <!-- <n-button
          style="padding-bottom: 0.7vh"
          quaternary
          circle
          @click="clickCloseBtn"
        >
          <template #icon>
            <n-icon size="28"><Close /></n-icon>
          </template>
        </n-button> -->
      </n-space>
    </template>
    <template #footer> <slot name="footer" /> </template>
    <template #action> <slot name="action" /> </template>
  </n-card>
</template>

<style scoped></style>
