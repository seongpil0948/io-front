<script setup lang="ts">
import { toRefs, ref } from "vue";
import { STORAGE_SVC } from "@/types";
import { IoUser, makeMsgOpt } from "@/composables";
import { refByRoleSvc, refByUid, uploadFile } from "@/plugins/firebase";
import { useMessage } from "naive-ui";
import { CloseCircle } from "@vicons/ionicons5";

const props = defineProps<{
  urls: string[];
  user?: IoUser;
  userId?: string;
  elemetId: string;
  size: string;
  max: number;
}>();
if (!props.userId && !props.user)
  throw new Error(
    "Single Image Input Compoenent Require Whether User ID or  User"
  );

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
    const parent = props.user
      ? refByRoleSvc(
          props.user.userInfo.role,
          STORAGE_SVC.VENDOR_PRODUCT,
          props.user.userInfo.userId
        )
      : refByUid(props.userId!);
    const imgs = await uploadFile(parent, input.value.files);
    emits("update:urls", [...urls.value, ...imgs]);
    loading.value = false;
  }
}
function closeFile(src: string) {
  emits(
    "update:urls",
    urls.value.filter((x) => x !== src)
  );
}
</script>
<template>
  <n-space inline justify="space-around">
    <div
      v-for="(src, i) in urls"
      :key="i"
      :style="`width: ${size}px; height: ${size}px; position: relative`"
    >
      <n-image :src="src" object-fit="contain" :width="size" :height="size" />
      <n-icon
        style="position: absolute; top: -15px; right: -15px; cursor: grabbing"
        size="25"
        @click="closeFile(src)"
        :component="CloseCircle"
      />
    </div>

    <div v-if="urls.length < max">
      <n-card :style="`width: ${size}px; height: ${size}px; `">
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
