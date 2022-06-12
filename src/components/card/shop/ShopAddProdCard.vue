<script setup lang="ts">
import { makeMsgOpt, ShopProd } from "@/composables";
import { shopProdExist } from "@/plugins/firebase";
import { useAuthStore } from "@/stores";
import type { PROD_SIZE, VendorUserProdCombined } from "@/types";
import { useMessage } from "naive-ui";
import { computed, ref, toRefs } from "vue";
import { v4 as uuidv4 } from "uuid";

const props = defineProps<{
  showAddModal: boolean;
  prod: VendorUserProdCombined;
}>();

const { prod, showAddModal } = toRefs(props);
const imgUrls = computed(() => [...prod.value.titleImgs, prod.value.bodyImgs]);
const selectedProdIds = ref<string[]>([]);
const optById: { [id: string]: { color: string; size: string } } = {};
const prodOpts = computed<{ value: string; label: string }[]>(() => {
  const result: { value: string; label: string }[] = [];
  prod.value.sizes.forEach((size) => {
    prod.value.colors.forEach((color) => {
      optById[prod.value.stockCnt[size][color].prodId] = {
        color,
        size,
      };
      result.push({
        value: prod.value.stockCnt[size][color].prodId,
        label: `${size} ${color} (${prod.value.stockCnt[size][color].stockCnt} ) `,
      });
    });
  });
  return result;
});
const emits = defineEmits(["update:showAddModal"]);

const auth = useAuthStore();
const msg = useMessage();
async function onSubmit() {
  for (let i = 0; i < selectedProdIds.value.length; i++) {
    const vendorProdId = selectedProdIds.value[i];
    if (await shopProdExist(vendorProdId, auth.currUser.userId)) {
      msg.error(
        `컬러 ${optById[vendorProdId].color}, 사이즈: ${optById[vendorProdId].size} 상품은 이미 존재합니다.`,
        makeMsgOpt()
      );
      continue;
    }

    const shopProd = new ShopProd({
      vendorId: prod.value.vendorId,
      vendorProdId,
      shopProdId: uuidv4(),
      shopId: auth.currUser.userId,
      prodPrice: prod.value.vendorPrice,
      prodName: prod.value.vendorProdName,
      size: optById[vendorProdId].size as PROD_SIZE,
      color: optById[vendorProdId].color,
    });
    await shopProd.update();
    selectedProdIds.value = [];
  }
  emits("update:showAddModal", false);
}
function onCheck(val: string) {
  if (selectedProdIds.value.includes(val)) {
    selectedProdIds.value.splice(selectedProdIds.value.indexOf(val), 1);
  } else {
    selectedProdIds.value.push(val);
  }
}
</script>

<template>
  <n-modal
    :show="showAddModal"
    :on-update:show="(val: boolean) => emits('update:showAddModal', val)"
    :mask-closable="false"
    :title="prod.userName"
    close-on-esc
    size="huge"
    preset="card"
    style="margin: 10vw"
  >
    <n-card>
      <n-space inline>
        <carousel-img-card
          :imgUrls="imgUrls"
          :width="30"
          :height="30"
          unit="vw"
        />
        <n-space vertical style="max-height: 50vh; overflow: auto; width: 100%">
          <n-h2>도매 상품명: {{ prod.vendorProdName }}</n-h2>
          <n-h2>도매가: {{ prod.vendorPrice }}원</n-h2>
          <n-space
            inline
            justify="space-between"
            v-for="(opt, i) in prodOpts"
            :key="i"
          >
            <logo-checker
              :size="2"
              :checked="selectedProdIds.includes(opt.value)"
              @click="onCheck(opt.value)"
            />
            <n-h4 style="margin-left: 20px">{{ opt.label }}</n-h4>
          </n-space>
        </n-space>
      </n-space>
    </n-card>

    <template #header-extra>
      <n-h3 v-if="prod.locations.length > 0">{{
        prod.locations[0].phone
      }}</n-h3>
    </template>
    <template #action>
      <n-space justify="end">
        <n-button @click="onSubmit"> 추가하기 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
