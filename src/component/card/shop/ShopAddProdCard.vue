<script setup lang="ts">
import { useMessage } from "naive-ui";
import { computed, ref, toRefs } from "vue";
import { v4 as uuidv4 } from "uuid";
import {
  GARMENT_SIZE,
  ShopGarment,
  SHOP_GARMENT_DB,
  VendorUserGarmentCombined,
  getUserLocate,
} from "@/composable";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { HouseTwotone } from "@vicons/material";
import { Phone20Filled } from "@vicons/fluent";
const props = defineProps<{
  showAddModal: boolean;
  prod: VendorUserGarmentCombined;
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
  let addCnt = selectedProdIds.value.length;
  for (let i = 0; i < selectedProdIds.value.length; i++) {
    const vendorProdId = selectedProdIds.value[i];
    if (
      await SHOP_GARMENT_DB.shopGarmentExist(
        vendorProdId,
        auth.currUser.userInfo.userId
      )
    ) {
      msg.error(
        `컬러 ${optById[vendorProdId].color}, 사이즈: ${optById[vendorProdId].size} 상품은 이미 추가 되었습니다.`,
        makeMsgOpt()
      );
      addCnt -= 1;
      continue;
    }

    const shopProd = new ShopGarment({
      vendorId: prod.value.vendorId,
      vendorProdId,
      shopProdId: uuidv4(),
      shopId: auth.currUser.userInfo.userId,
      prodPrice: prod.value.vendorPrice,
      prodName: prod.value.vendorProdName,
      info: prod.value.info,
      description: prod.value.description,
      size: optById[vendorProdId].size as GARMENT_SIZE,
      color: optById[vendorProdId].color,
    });
    await shopProd.update();
  }
  msg.success(`${addCnt}개의 상품 추가완료!`);
  selectedProdIds.value = [];
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
    close-on-esc
    size="huge"
    preset="card"
    style="margin: 0 10%"
  >
    <n-space
      size="large"
      inline
      style="border: grey solid 1px; padding: 10px; width: 70vw"
      justify="space-around"
    >
      <carousel-img-card
        :imgUrls="imgUrls"
        :width="30"
        :height="30"
        unit="vw"
      />
      <n-space vertical style="max-height: 50vh; overflow: auto; width: 35vw">
        <n-space justify="space-between" v-if="getUserLocate(prod)">
          <n-button text>
            <template #icon>
              <n-icon size="24" :component="HouseTwotone" />
            </template>
            {{ getUserLocate(prod)!.detailLocate }}</n-button
          >
          <n-button text>
            <template #icon>
              <n-icon size="24" :component="Phone20Filled" />
            </template>
            {{ getUserLocate(prod)!.phone }}</n-button
          >
        </n-space>
        <n-divider style="width: 100%" />
        <n-h2>{{ prod.vendorProdName }}</n-h2>

        <n-h2>{{ prod.vendorPrice }}원</n-h2>
        <n-space
          inline
          justify="space-between"
          align="center"
          style="border: grey solid 1px; padding: 10px; width: 25vw"
          v-for="(opt, i) in prodOpts"
          :key="i"
        >
          <n-h4 style="margin: 0">{{ opt.label }}</n-h4>
          <logo-checker
            :size="1"
            :checked="selectedProdIds.includes(opt.value)"
            @onClick="onCheck(opt.value)"
            style="margin-right: 20px"
          />
        </n-space>
      </n-space>
    </n-space>

    <template #action>
      <n-space justify="end">
        <n-button @click="onSubmit"> 추가하기 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
