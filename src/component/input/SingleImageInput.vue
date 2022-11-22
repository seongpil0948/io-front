<script setup lang="ts">
import { toRefs, ref } from "vue";
import { NCard, NIcon, NImage, NSpace, NSpin, useMessage } from "naive-ui";
import { CloseCircle } from "@vicons/ionicons5";
import { makeMsgOpt } from "@/util";
import { STORAGE_SVC, getParentRef, uploadFile } from "@io-boxies/js-lib";

const props = defineProps<{
  svc: STORAGE_SVC;
  urls: string[];
  userId: string;
  parentId?: string;
  elementId: string;
  size: string;
  max: number;
}>();

const { urls, size, max, elementId } = toRefs(props);
const emits = defineEmits(["update:urls"]);
const input = ref<HTMLInputElement | null>(null);
const msg = useMessage();
const loading = ref(false);
async function loadFile() {
  if (!input.value || !input.value!.files) return;
  else if (input.value.files.length + urls.value.length > max.value) {
    return msg.error(`${max.value} 장까지 업로드 가능합니다.`, makeMsgOpt());
  } else if (input.value.files && input.value.files.length > 0) {
    loading.value = true;
    const parent = getParentRef({
      svc: props.svc,
      parentId: props.parentId,
      userId: props.userId,
    });

    const imgs = await uploadFile(parent, input.value.files);
    emits("update:urls", [...urls.value, ...imgs]);
    loading.value = false;
  }
}
async function closeFile(src: string) {
  // const refer = getUrlRef(src);
  // await deleteCdnObj([refer]);
  emits(
    "update:urls",
    urls.value.filter((x) => x !== src)
  );
}
</script>
<template>
  <n-space inline justify="start">
    <div
      v-for="(src, i) in urls"
      :key="i"
      :style="`width: ${size}px; height: ${size}px; position: relative`"
    >
      <n-image :src="src" object-fit="contain" :width="size" :height="size" />
      <n-icon
        style="position: absolute; top: -15px; right: -15px; cursor: grabbing"
        size="25"
        :component="CloseCircle"
        @click="closeFile(src)"
      />
    </div>

    <div v-if="urls.length < max">
      <n-card :style="`width: ${size}px; height: ${size}px; `">
        <label :for="elementId">
          <n-spin :show="loading"><slot /> </n-spin
        ></label>
      </n-card>

      <input
        :id="elementId"
        ref="input"
        type="file"
        multiple
        style="visibility: hidden"
        :name="elementId"
        accept="image/*"
        @change="loadFile"
      />
    </div>
  </n-space>
</template>
