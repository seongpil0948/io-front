<script setup lang="ts">
import { computed, h, ref, VNode } from "vue";
import {
  NTag,
  NButton,
  useMessage,
  DataTableColumns,
  NSpace,
  DataTableRowKey,
} from "naive-ui";
import GarmentOrderRow from "@/component/table/vendor/GarmentOrderRow.vue";
import {
  GarmentOrder,
  ORDER_STATE,
  ProdOrderByShop,
  ProdOrderCombined,
  useReadVendorOrderGInfo,
} from "@/composable";
import { useAuthStore } from "@/store";

const props = defineProps<{
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
}>();

const auth = useAuthStore();
const { orders, garmentOrders, garmentOrdersByShop } = useReadVendorOrderGInfo(
  auth.currUser.userInfo.userId,
  props.inStates ?? [],
  props.notStates ?? []
);

const checkedOrders = ref<string[]>([]); // garment order id
const checkedShops = ref<DataTableRowKey[]>([]); // shop id

const message = useMessage();
function getRowKey(row: ProdOrderByShop) {
  return row.shopId;
}
function onClickShop(keys: DataTableRowKey[]) {
  checkedShops.value = keys;
}
function approvePartial() {
  console.log("approvePartial, checkedOrders: ", checkedOrders.value);
}
function approveSelected() {
  console.log("approveSelected, checkedShops: ", checkedShops.value);
}
function rejectSelected() {
  console.log("rejectSelected, checkedOrders: ", checkedOrders.value);
}
function approveAll() {
  console.log("approveAll, checkedShops: ", checkedShops.value);
}

const columns = computed(() => {
  const cols = [
    {
      type: "selection",
    },
    {
      type: "expand",
      expandable: (row) => row.items.length > 0,
      renderExpand: (row) => {
        const children: VNode[] = [];
        for (let i = 0; i < row.items.length; i++) {
          const item = row.items[i];
          children.push(
            h(GarmentOrderRow, {
              garmentOrder: item as ProdOrderCombined,
              checked: checkedOrders.value.includes(item.id),
              onClick: () => {
                const cs = checkedOrders.value;
                if (cs.includes(item.id)) {
                  cs.splice(
                    cs.findIndex((x) => x === item.id),
                    1
                  );
                } else {
                  cs.push(item.id);
                }
              },
            })
          );
        }
        return h(
          NSpace,
          { vertical: true, style: { "margin-left": "4%" } },
          { default: () => children }
        );
      },
    },
    {
      title: "#",
      key: "key",
      render: (_, index) => {
        return `${index + 1}`;
      },
    },
    {
      title: "거래처명",
      key: "name",
      render: (row) => row.shopName,
    },
    {
      title: "품목수량",
      key: "age",
      render: (row) => row.items.length,
    },
    {
      title: "주문수량",
      key: "orderCnt",
      render: (row) => row.items.reduce((acc, curr) => acc + curr.orderCnt, 0),
    },
    {
      title: "미송개수",
      key: "pendingCnt",
      render: (row) =>
        row.items.reduce((acc, curr) => acc + curr.pendingCnt, 0),
    },
    {
      title: "결제금액",
      key: "orderAmount",
      render: (row) =>
        row.items
          .reduce((acc, curr) => acc + curr.actualAmount.orderAmount, 0)
          .toLocaleString(),
    },
  ] as DataTableColumns<ProdOrderByShop>;
  return cols.map((x: any) => {
    if (!["selection", "expand"].includes(x.type)) {
      x.sorter = "default";
    }
    return x;
  });
});
</script>

<template>
  <n-card :bordered="false">
    <template #header> <div></div> </template>
    <template #header-extra>
      <n-space>
        <n-button size="small" type="primary" @click="approvePartial">
          부분승인(미송)
        </n-button>
        <n-button size="small" type="primary" @click="approveSelected">
          선택승인
        </n-button>
        <n-button size="small" type="primary" @click="rejectSelected">
          선택거부
        </n-button>
        <n-button size="small" type="primary" @click="approveAll">
          전체승인
        </n-button>
      </n-space>
    </template>
    <n-data-table
      :bordered="false"
      :columns="columns"
      :data="garmentOrdersByShop"
      :rowKey="getRowKey"
      :handleCheck="onClickShop"
      default-expand-all
    />
  </n-card>

  <!-- <n-data-table
            :columns="columns"
            :data="garmentOrdersByShop"
            row-key="id"
            children-key="items"
            default-expand-all
          /> -->
</template>
