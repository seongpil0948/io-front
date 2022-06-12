<script setup lang="ts">
import { toRefs, ref } from "vue";
import { STORAGE_SVC } from "@/types";
import { IoUser, makeMsgOpt } from "@/composables";
import { refByRoleSvc, uploadFile } from "@/plugins/firebase";
import { useMessage } from "naive-ui";
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
const msg = useMessage();
let loading = ref(false);
async function loadFile() {
  if (!input.value || !input.value!.files) return;
  else if (input.value.files.length + urls.value.length > 5) {
    return msg.error("5장까지 업로드 가능합니다.", makeMsgOpt());
  } else if (input.value.files && input.value.files.length > 0) {
    loading.value = true;
    const parent = refByRoleSvc(
      props.user.role,
      STORAGE_SVC.VENDOR_PRODUCT,
      props.user.userId
    );
    const imgs = await uploadFile(parent, input.value.files);
    emits("update:urls", [...urls.value, ...imgs]);
    loading.value = false;
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
        <label :for="elemetId">
          <n-spin :show="loading"><slot></slot> </n-spin
        ></label>
      </n-card>

      <input
        ref="input"
        type="file"
        multiple
        style="visibility: hidden"
        :id="elemetId"
        :name="elemetId"
        accept="image/*"
        @change="loadFile"
      />
    </div>
  </n-space>
</template>
