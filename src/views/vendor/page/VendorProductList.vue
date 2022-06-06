<script setup lang="ts">
import { useAuthStore } from "@/stores";
import type { IoColOpt, VendorOrderProd } from "@/types";
import { useTable, useVendor, VendorProd } from "@/composables";
import { h, watchEffect } from "vue";
import LogoChecker from "@/components/input/LogoChecker.vue";
import { NButton, useMessage } from "naive-ui";
const auth = useAuthStore();
const msg = useMessage();
const { orderProds } = useVendor(auth.currUser.userId);
const { columns } = useTable<VendorOrderProd>({
  userId: auth.currUser.userId,
  colKeys: [
    "vendorProdName",
    "vendorPrice",
    "amount",
    "size",
    "color",
    "stockCnt",
    "amount",
    "pendingCnt",
  ].map((x) => {
    return { key: x } as IoColOpt;
  }),
});
watchEffect(() => {
  columns.value.push(
    ...[
      {
        title: "미송설정",
        key: "allowPending",
        render: (row: VendorOrderProd) =>
          h(LogoChecker, {
            checked: row.allowPending,
            size: 1.5,
            onClick: async () => {
              if (
                (!row.allowPending === false && row.pendingCnt === 0) ||
                !row.allowPending === true
              ) {
                row.allowPending = !row.allowPending;
                await VendorProd.fromJson(row)!.update();
                msg.success("미송정보 수정에 성공하였습니다.");
              } else {
                msg.error(
                  "미송 비활성화를 위해서는 미송 개수가 0이어야합니다."
                );
              }
            },
          }),
      },
      {
        title: () =>
          h(
            NButton,
            {
              round: true,
              onClick: () => {
                console.log("Clicked 변경사항 수정 Title");
              },
            },
            { default: () => "변경사항 수정" }
          ),
        key: "edit",
        render: (row: VendorOrderProd) =>
          h(
            NButton,
            {
              round: true,
              onClick: () => {
                // FIXME: 상품등록 컴포넌트들 제대로만들고 카드화해서 수정시에도 사용 가능하게끔
                console.log("Clicked 상품수정", row);
              },
            },
            { default: () => "상품수정" }
          ),
      },
    ]
  );
});
</script>
<template>
  <n-card>
    <template #header> 상품목록 </template>
    <n-data-table
      :columns="columns"
      :data="orderProds"
      :pagination="{
        pageSize: 5,
      }"
      :bordered="false"
    />
  </n-card>
</template>
