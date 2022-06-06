<script setup lang="ts">
import { toRefs, ref } from "vue";
import { STORAGE_SVC } from "@/types";
import { IoUser } from "@/composables";
import { refByRoleSvc, uploadFile } from "@/plugins/firebase";
const props = defineProps<{
  urls: string[];
  user: IoUser;
  elemetId: string;
  size: string;
  max: number;
}>();
const { urls, size, max, elemetId } = toRefs(props);
const emits = defineEmits(["update:urls"]);
const input = ref<HTMLInputElement | null>(null);
async function loadFile() {
  console.log(input.value);
  if (!input.value) return;
  else if (input.value.files && input.value.files.length > 0) {
    var file = input.value.files[0];
    const parent = refByRoleSvc(
      props.user.role,
      STORAGE_SVC.VENDOR_PRODUCT,
      props.user.userId
    );
    const imgs = await uploadFile(parent, [file]);
    emits("update:urls", [...urls.value, imgs[0]]);
  }
}
</script>
<template>
  <n-space inline>
    <n-image
      v-for="(src, i) in urls"
      :key="i"
      :style="`width: ${size}; height: ${size};`"
      :src="src"
    />
    <div v-if="urls.length < max">
      <n-card :style="`width: ${size}; height: ${size};`">
        <label :for="elemetId"> <slot></slot> </label>
      </n-card>
      <input
        ref="input"
        type="file"
        style="visibility: hidden"
        :id="elemetId"
        :name="elemetId"
        accept="image/*"
        @change="loadFile"
      />
    </div>
  </n-space>
</template>
