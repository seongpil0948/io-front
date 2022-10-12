<script setup lang="ts">
import {
  useTable,
  IoColOpt,
  VendorUserOrderGarment,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable/";
import { useAuthStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { NButton, useMessage } from "naive-ui";
import { watchEffect, h, ref, computed } from "vue";
import { useLogger } from "vue-logger-plugin";
import LogoChecker from "@/component/input/checker/LogoChecker.vue";
import { useVendorOrderStore } from "@/store/vendorOrder";

const logger = useLogger();
const auth = useAuthStore();
const msg = useMessage();

const store = useVendorOrderStore();
const orders = store.getOrders([]);
const vendorOrderGarments = store.getVendorOrderGarments(orders);

const colKeys = [
  "vendorProdName",
  "size",
  "color",
  "orderCnt",
  "pendingCnt",
  "stockCnt",
  "vendorPrice",
  "actualAmount.orderAmount",
].map((x) => {
  return { key: x } as IoColOpt;
});
colKeys.unshift({ imgField: true, key: "titleImgs" });
const { columns } = useTable<Omit<VendorUserOrderGarment, "account">>({
  userId: auth.currUser.userInfo.userId,
  colKeys,
});
watchEffect(() => {
  columns.value.push(
    ...[
      {
        title: "미송설정",
        key: "allowPending",
        render: (row: VendorUserOrderGarment) =>
          h(LogoChecker, {
            checked: row.allowPending,
            size: 1.5,
            onClick: async () => {
              if (
                (!row.allowPending === false && row.pendingCnt === 0) ||
                !row.allowPending === true
              ) {
                row.allowPending = !row.allowPending;
                await VendorGarment.fromJson(row)!.update();
                msg.success("미송정보 수정에 성공하였습니다.", makeMsgOpt());
              } else {
                msg.error(
                  "미송 비활성화를 위해서는 미송 개수가 0이어야합니다.",
                  makeMsgOpt()
                );
              }
            },
          }),
      },
      {
        title: "수정",
        key: "edit",
        render: (row: VendorUserOrderGarment) =>
          h(
            NButton,
            {
              round: true,
              onClick: () => {
                onShowProdEdit(VendorGarment.fromJson(row));
              },
            },
            { default: () => "수정" }
          ),
      },
      {
        title: "삭제",
        key: "delete",
        render: (row: VendorUserOrderGarment) =>
          h(
            NButton,
            {
              round: true,
              onClick: () => {
                VENDOR_GARMENT_DB.delete(row.vendorProdId)
                  .then(() => msg.success("삭제성공.", makeMsgOpt()))
                  .catch((err) => {
                    const message = `삭제실패. ${
                      err instanceof Error ? err.message : JSON.stringify(err)
                    }`;
                    msg.error(message, makeMsgOpt());
                    logger.error(auth.currUser.userInfo.userId, message);
                  });
              },
            },
            { default: () => "삭제" }
          ),
      },
    ]
  );
});
const showProdEdit = ref(false);
const prodEditTarget = ref<VendorGarment | null>(null);
function onShowProdEdit(row: VendorGarment | null) {
  if (!row) {
    showProdEdit.value = false;
    prodEditTarget.value = null;
  } else {
    showProdEdit.value = true;
    prodEditTarget.value = row;
  }
}

const searchVal = ref<string | null>(null);
const searchInputVal = ref<string | null>(null);
const filteredProds = computed(() => {
  const v = searchVal.value;
  return v
    ? vendorOrderGarments.value.filter((vog) => {
        return (
          vog.size.includes(v) ||
          vog.color.includes(v) ||
          vog.vendorProdName.includes(v)
        );
      })
    : vendorOrderGarments.value;
});
function search() {
  searchVal.value = searchInputVal.value;
}
</script>
<template>
  <n-card style="width: 80%">
    <template #header> 상품목록 </template>
    <template #header-extra>
      <n-input v-model:value="searchInputVal" placeholder="상품검색" />
      <n-button @click="search">검색</n-button>
    </template>

    <n-data-table
      :scroll-x="1200"
      :columns="columns"
      :data="filteredProds"
      :pagination="{
        'show-size-picker': true,
        'page-sizes': [5, 10, 25, 50, 100],
      }"
      :bordered="false"
    />
  </n-card>
  <n-modal
    v-model:show="showProdEdit"
    preset="card"
    style="width: 70%"
    title="상품 정보 수정"
  >
    <vendor-prod-edit-form
      v-if="showProdEdit && prodEditTarget"
      :prod="prodEditTarget"
      @onSubmitProd="onShowProdEdit(null)"
    />
  </n-modal>
</template>
