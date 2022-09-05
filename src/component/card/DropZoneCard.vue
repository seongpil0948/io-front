<template>
  <n-card
    class="base-card"
    :style="`border-color: grey; box-shadow: ${
      isDragActive ? '0 0 10px -1px ' + '#f0c755' : 'none'
    };`"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
  >
    <template #header> <slot name="header"></slot> </template>
    <template #header-extra> <slot name="header-extra"></slot> </template>
    <div v-bind="getRootProps()">
      <div v-if="listenClick">
        <input v-bind="getInputProps()" />
      </div>
      <slot v-bind="{ hovered, activeColor, isDragActive }">
        <div style="padding: 10% 20%">
          <div style="margin-bottom: 12px">
            <n-icon size="120" :depth="hovered ? 1 : 3">
              <add-circle-outline />
            </n-icon>
          </div>
          <n-el
            depth="3"
            tag="n-p"
            :style="`font-size:1.1rem; font-weight: 100; color: ${
              hovered === true ? activeColor : 'var(--n-close-color-pressed)'
            }`"
          >
            <n-text type="primary" v-if="!isDragActive">
              클릭 혹은 드래그앤드롭(Drag&Drop) 으로 사입리스트를 업로드하세요!
            </n-text>
            <n-text type="primary" v-else>좋아요! 내려놓으세요!</n-text>
          </n-el>
        </div>
      </slot>
    </div>
    <template #footer> <slot name="footer"></slot> </template>
    <template #action> <slot name="action"></slot> </template>
  </n-card>
</template>

<script setup>
import { NCard, NIcon, useMessage } from "naive-ui";
import { ref, toRefs } from "vue";
import { AddCircleOutline } from "@vicons/ionicons5";
import { useDropzone } from "vue3-dropzone";
import { makeMsgOpt } from "@/util";

const props = defineProps({
  listenClick: {
    type: Boolean,
    default: () => true,
  },
  fileModel: {
    type: Array,
    required: false,
  },
  activeColor: {
    type: String,
    required: false,
    default: () => "var(--primary-color)",
  },
});

const { listenClick } = toRefs(props);
const msg = useMessage();
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  multiple: Array.isArray(props.fileModel),
});

const emits = defineEmits(["update:fileModel"]);

async function onDrop(acceptFiles, rejectReasons) {
  if (rejectReasons.length > 0) {
    msg.error("Upload Fail, Reasons: ", rejectReasons, makeMsgOpt());
  }
  emits("update:fileModel", acceptFiles);
}
const hovered = ref(false);
</script>
<style scoped>
.base-card {
  margin-top: 2.5vh;
  margin-bottom: 2.5vh;
}
</style>
