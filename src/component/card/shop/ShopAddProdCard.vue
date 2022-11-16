<script setup lang="ts">
import { useMessage } from "naive-ui";
import { computed, ref, toRefs } from "vue";
import {
  GARMENT_SIZE,
  ShopGarment,
  SHOP_GARMENT_DB,
  VendorUserGarmentCombined,
  ShopUserGarment,
} from "@/composable";
import { getUserLocate } from "@io-boxies/js-lib";
import { useAuthStore, useShopOrderStore, useVendorsStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { Home24Filled, Phone20Filled } from "@vicons/fluent";
import { useEditor } from "@/plugin/editor";
import { useLogger } from "vue-logger-plugin";
import { uuidv4 } from "@firebase/util";

const props = defineProps<{
  showAddModal: boolean;
  prod: VendorUserGarmentCombined;
}>();

const { prod, showAddModal } = toRefs(props);
const imgUrls = computed(() => [
  ...prod.value.titleImgs,
  ...prod.value.bodyImgs,
  ...prod.value.bodyImgs,
]);
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
const shopOrdStore = useShopOrderStore();
const vendorStore = useVendorsStore();
const log = useLogger();
const uid = auth.currUser.userInfo.userId;

async function onSubmit() {
  let addCnt = selectedProdIds.value.length;
  for (let i = 0; i < selectedProdIds.value.length; i++) {
    const vendorProdId = selectedProdIds.value[i];
    if (await SHOP_GARMENT_DB.shopGarmentExist(vendorProdId, uid)) {
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
      shopId: uid,
      prodPrice: prod.value.vendorPrice,
      prodName: prod.value.vendorProdName,
      info: prod.value.info,
      description: prod.value.description,
      size: optById[vendorProdId].size as GARMENT_SIZE,
      color: optById[vendorProdId].color,
    });
    await shopProd.update();
    if (
      !shopOrdStore.shopGarments.find(
        (x) => x.shopProdId == shopProd.shopProdId
      )
    ) {
      const vendorUnit = vendorStore.vendorUserGarments.find(
        (y) => y.vendorProdId === vendorProdId
      );
      if (!vendorUnit) {
        log.error(
          uid,
          `vendor store contain vendorProdId(${vendorProdId}) in shop add card`
        );
      } else {
        const userGarment: ShopUserGarment = Object.assign(
          {},
          vendorUnit,
          shopProd
        );
        shopOrdStore.$patch({
          shopGarments: [
            ...shopOrdStore.shopGarments,
            userGarment,
          ] as ShopUserGarment[],
        });
      }
    }
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

useEditor({
  readOnly: true,
  elementId: "io-editor",
  placeholder: "상품 정보 입력",
  data: prod.value!.info,
});
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
    <n-space vertical style="overflow: auto; max-height: 75vh">
      <n-card>
        <n-space size="large" inline justify="space-between" style="width: 98%">
          <carousel-img-card
            :img-urls="imgUrls"
            :width="30"
            :height="30"
            unit="vw"
          />
          <n-space vertical style="width: 35vw">
            <n-space v-if="getUserLocate(prod)" justify="space-between">
              <n-button text>
                <template #icon>
                  <n-icon size="24" :component="Home24Filled" />
                </template>
                {{ getUserLocate(prod)!.detailLocate }}
              </n-button>
              <n-button text>
                <template #icon>
                  <n-icon size="24" :component="Phone20Filled" />
                </template>
                {{ getUserLocate(prod)!.phone }}
              </n-button>
            </n-space>
            <n-divider style="width: 100%" />
            <n-h2 style="padding-top: 0px">
              {{ prod.vendorProdName }}
            </n-h2>

            <n-h2 style="padding-top: 0px"> {{ prod.vendorPrice }}원 </n-h2>
            <div style="max-height: 20vw; overflow: auto; padding: 2%">
              <n-card
                v-for="(opt, i) in prodOpts"
                :key="i"
                style="width: 25vw; margin: auto; margin-bottom: 10px"
                content-style="
                  padding: 10px;
                  display: inline-flex;
                  flex-flow: row wrap;
                  justify-content: space-between;
                    align-items: center;
                "
              >
                <n-h4 style="margin: 0; padding-bottom: 3%">
                  {{ opt.label }}
                </n-h4>
                <logo-checker
                  :size="1"
                  :checked="selectedProdIds.includes(opt.value)"
                  style="margin-right: 20px"
                  @on-click="onCheck(opt.value)"
                />
              </n-card>
            </div>
          </n-space>
        </n-space>
      </n-card>
      <n-descriptions
        bordered
        label-placement="left"
        :column="4"
        style="margin-top: 1%"
      >
        <template #header>
          <n-h3>기본정보</n-h3>
        </template>
        <n-descriptions-item>
          <template #label> 카테고리 </template>
          {{ prod.part }} > {{ prod.ctgr }}
        </n-descriptions-item>
        <n-descriptions-item label="혼용률 / 제조국">
          {{ prod.fabric }}
        </n-descriptions-item>
      </n-descriptions>
      <n-descriptions
        :column="1"
        bordered
        label-placement="top"
        style="margin-top: 1%"
      >
        <n-descriptions-item>
          <template #label>
            <n-h3>상품 요약</n-h3>
          </template>
          {{ prod.description }}
        </n-descriptions-item>
        <n-descriptions-item>
          <template #label>
            <n-h3>상세 정보</n-h3>
          </template>
          <div id="io-editor" />
          />
        </n-descriptions-item>
      </n-descriptions>
    </n-space>
    <template #action>
      <n-space justify="end">
        <n-button @click="onSubmit"> 추가하기 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
