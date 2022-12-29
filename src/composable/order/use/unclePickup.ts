import { useUncleWorkers } from "@/composable/auth";
import { useAuthStore, useUncleOrderStore } from "@/store";
import {
  getUserName,
  batchInQuery,
  getIoCollection,
  IoCollection,
  dataFromSnap,
} from "@io-boxies/js-lib";
import { uniqueArr } from "@/util";
import {
  NButton,
  DataTableColumns,
  NAvatarGroup,
  DataTableRowKey,
  NText,
} from "naive-ui";
import ag from "naive-ui/es/avatar-group/src/AvatarGroup";
import { ref, computed, watchEffect, h, watch } from "vue";
import { ORDER_STATE, ShipOrder, ShipOrderByShop } from "../domain";
import { IoShipment } from "../model";
import { ioFireStore } from "@/plugin/firebase";

export function useShipmentUncle(inStates: ORDER_STATE[]) {
  const auth = useAuthStore();
  const u = auth.currUser;
  const ordStore = useUncleOrderStore();
  const orders = computed(() => ordStore.orders);
  const ioOrders = ordStore.getFilteredOrder(inStates);
  const ioOrdersByShop = ordStore.getGarmentOrdersByShop(ioOrders);
  const orderShips = ref<ShipOrder[]>([]);
  const { imageById, workers } = useUncleWorkers();

  const checkedKeys = ref<DataTableRowKey[]>([]);
  function onCheckRow(keys: DataTableRowKey[]) {
    checkedKeys.value = keys;
  }
  const checkedDetailKeys = ref<DataTableRowKey[]>([]);
  function onCheckDetailRow(keys: DataTableRowKey[]) {
    checkedDetailKeys.value = keys;
  }
  const selectedData = ref<ShipOrderByShop | null>(null);
  function onClickDetail(data: ShipOrderByShop) {
    selectedData.value = data;
  }
  const openWorkerModal = ref(false);

  watch(
    () => openWorkerModal.value,
    (val) => {
      if (val === false) {
        selectedData.value = null;
      }
    }
  );

  function renderWorker(row: ShipOrder) {
    const worker = workers.value.find((x) => x.userInfo.userId === row.uncleId);
    const btn = h(
      NText,
      // {
      //   onClick: () => (openWorkerModal.value = true),
      // },
      { default: () => (worker ? getUserName(worker) : "미배정") }
    );
    return btn;
  }

  const orderShipsByShop = computed<ShipOrderByShop[]>(() =>
    orderShips.value.reduce((acc, curr) => {
      const exist = acc.find((x) => x.shopId === curr.shopProd.shopId);
      if (!exist) {
        acc.push({
          shopId: curr.shopProd.shopId,
          shopName:
            curr.shopProd.userInfo.displayName ??
            curr.shopProd.userInfo.userName,
          items: [curr],
          uncleImgs: [imageById.value[curr.uncleId!]],
        });
        return acc;
      } else {
        exist.items.push(curr);
        const url = imageById.value[curr.uncleId!];
        if (!exist.uncleImgs.includes(url)) exist.uncleImgs.push(url);
      }

      return acc;
    }, [] as ShipOrderByShop[])
  );
  async function refreshOrderShip() {
    orderShips.value = [];
    if (ioOrders.value.length > 0) {
      const shipIds: string[] = [];
      for (let i = 0; i < ioOrders.value.length; i++) {
        const o = ioOrders.value[i];
        if (o.shipmentId) shipIds.push(o.shipmentId);
      }

      const snapshots = await batchInQuery<IoShipment | null>(
        shipIds,
        getIoCollection(ioFireStore, {
          c: IoCollection.SHIPMENT,
          uid: u.userInfo.userId,
        }).withConverter(IoShipment.fireConverter()),
        "shippingId"
      );
      const shipments = snapshots.flatMap(dataFromSnap<IoShipment>);

      for (let k = 0; k < ioOrders.value.length; k++) {
        const ord = ioOrders.value[k];
        for (let z = 0; z < shipments.length; z++) {
          const shipment = shipments[z];
          if (ord.shipmentId === shipment.shippingId) {
            orderShips.value.push(Object.assign({}, ord, shipment));
          }
        }
      }
    }
  }
  watchEffect(async () => await refreshOrderShip());

  // 소매 도매수 건물 픽업 담당자들 상세
  const byShopCols = computed(() => {
    const cols = [
      {
        type: "selection",
      },
      {
        title: "소매처명",
        key: "shopName",
      },
      {
        title: "도매수량",
        key: "items.length",
        render: (row) =>
          h(
            "div",
            {},
            {
              default: () => uniqueArr(row.items.map((x) => x.vendorId)).length,
            }
          ),
      },

      {
        title: "픽업수량",
        key: "orderCnt",
        render: (row) =>
          row.items.reduce((acc, curr) => acc + curr.orderCnt, 0),
      },

      {
        title: "담당자",
        key: "worker",
        render: (row) =>
          h(
            NAvatarGroup,
            {
              options: row.uncleImgs.map((x) => {
                return { src: x };
              }) as typeof ag.AvatarOption,
              size: 40,
              max: 3,
            },
            {}
          ),
      },
      {
        title: "상세",
        key: "detail",
        render: (row) =>
          h(
            NButton,
            {
              onClick: () => onClickDetail(row),
              size: "small",
            },
            { default: () => "상세보기" }
          ),
      },
    ] as DataTableColumns<ShipOrderByShop>;
    return cols.map((x: any) => {
      if (!["selection"].includes(x.type)) {
        x.sorter = "default";
      }
      return x;
    });
  });
  const byShopDetailCols = computed(() => {
    const cols = [
      {
        type: "selection",
      },
      {
        title: "담당자",
        key: "shipManager",
        render: renderWorker,
      },
      {
        title: "도매",
        key: "vendorProd.userInfo.displayName",
      },
      {
        title: "상품명",
        key: "vendorProd.vendorProdName",
      },
      {
        title: "상태",
        key: "state",
        render: (row) =>
          h(NText, { type: "info" }, { default: () => ORDER_STATE[row.state] }),
      },
      {
        title: "픽업수량",
        key: "orderCnt",
      },
      {
        title: "도착지 주소",
        key: "receiveAddress.detailLocate",
        // render: (row) => IoOrder.isShipping(row) ? ,
      },
      {
        title: "출발지 주소",
        key: "startAddress.detailLocate",
      },
    ] as DataTableColumns<ShipOrder>;
    return cols.map((x: any) => {
      if (!["selection"].includes(x.type)) {
        x.sorter = "default";
      }
      return x;
    });
  });

  return {
    orderShipsByShop,
    byShopCols,
    imageById,
    workers,
    refreshOrderShip,
    orders,
    checkedKeys,
    onCheckRow,
    checkedDetailKeys,
    onCheckDetailRow,
    selectedData,
    onClickDetail,
    openWorkerModal,
    byShopDetailCols,
    ioOrdersByShop,
    ioOrders,
  };
}
