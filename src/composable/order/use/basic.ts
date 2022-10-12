import { IoUser, GarmentOrder, useAlarm } from "@/composable";
import { IO_COSTS } from "@/constants";
import { makeMsgOpt, uniqueArr } from "@/util";
import { useMessage } from "naive-ui";
import { ref, computed, Ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { ORDER_GARMENT_DB } from "../db";
import { ProdOrderCombined } from "../domain";
import { DataFrame, toExcel } from "danfojs";

export function useOrderBasic(
  user: IoUser,
  garmentOrders: Ref<ProdOrderCombined[]>,
  orders: Ref<GarmentOrder[]>,
  checkedKeys: Ref<string[]>
) {
  const log = useLogger();
  const msg = useMessage();
  const smtp = useAlarm();
  const orderTargets = ref<ProdOrderCombined[]>([]);
  const expectedReduceCoin = computed(
    () => IO_COSTS.REQ_ORDER * orderTargets.value.length
  );
  const showReqOrderModal = ref(false);
  const keyField = "id";

  function updateReqOrderShow(val: boolean) {
    if (!val) orderTargets.value = [];
    showReqOrderModal.value = val;
  }
  async function onReqOrderConfirm() {
    const ids = orderTargets.value.map((x) => x.id);

    ORDER_GARMENT_DB.orderGarment(
      orders.value
        .filter((y) => y.items.some((item) => ids.includes(item.id)))
        .map((x) => x.dbId),
      ids,
      user.userInfo.userId
    )
      .then(async (results) => {
        // console.log("RESULTS: ", results);
        const vendorIds = uniqueArr(results.flatMap((x) => x.vendorIds));
        msg.success(`${results.length}건 주문 성공.`, makeMsgOpt());
        await smtp.sendAlarm({
          toUserIds: vendorIds,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${user.name} 으로부터 주문 요청이 도착하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
      })
      .catch((err) => {
        if (typeof err.toString && err.toString().includes("out of stock")) {
          msg.error(`주문개수가 재고 수량보다 많습니다.`, makeMsgOpt());
        } else {
          const message =
            err instanceof Error ? err.message : JSON.stringify(err);
          msg.error(`주문 실패. ${message}`, makeMsgOpt());
          log.error(user.userInfo.userId, `주문 실패. ${message}`);
        }
      })
      .finally(() => {
        orderTargets.value = [];
        showReqOrderModal.value = false;
      });
  }

  async function deleteChecked() {
    const targetProds = garmentOrders.value.filter((x) =>
      checkedKeys.value.includes(x[keyField]!)
    );
    const ids = targetProds.map((prod) => prod.id);
    const targets: GarmentOrder[] = [];
    for (let i = 0; i < ids.length; i++) {
      const prodOrderId = ids[i];
      for (let j = 0; j < orders.value.length; j++) {
        const ord = orders.value[j];
        for (let k = 0; k < ord.items.length; k++) {
          const item = ord.items[k];
          if (item.id !== prodOrderId) continue;
          if (ord.items.length < 2) {
            if (!targets.map((z) => z.dbId).includes(ord.dbId)) {
              targets.push(ord);
            }
          } else {
            ord.items.splice(k, 1);
            await ord.update();
          }
        }
      }
    }
    return ORDER_GARMENT_DB.batchDelete(targets)
      .then(() => msg.success("삭제 성공.", makeMsgOpt()))
      .catch((err) =>
        msg.success(
          `삭제 실패. ${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`,
          makeMsgOpt()
        )
      );
  }
  async function deleteAll() {
    return ORDER_GARMENT_DB.batchDelete(orders.value)
      .then(() => msg.success("삭제 성공.", makeMsgOpt()))
      .catch((err) =>
        msg.success(
          `삭제 실패. ${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`,
          makeMsgOpt()
        )
      );
  }
  async function orderChecked() {
    orderTargets.value = garmentOrders.value.filter((x) =>
      checkedKeys.value.includes(x[keyField]!)
    );
    showReqOrderModal.value = true;
  }
  async function orderAll() {
    orderTargets.value = garmentOrders.value;
    showReqOrderModal.value = true;
  }

  return {
    orderAll,
    orderChecked,
    deleteAll,
    orderTargets,
    expectedReduceCoin,
    showReqOrderModal,
    keyField,
    updateReqOrderShow,
    onReqOrderConfirm,
    deleteChecked,
    downProdOrders,
  };
}

export function downProdOrders(gOrders: ProdOrderCombined[]) {
  const df = pOrdersToFrame(gOrders);
  toExcel(df, { fileName: "testOut.xlsx" });
  const a = document.createElement("a");
  // a.href = url
  a.href = "testOut.xlsx";
  a.download = "testOut.xlsx";
  // a.click();
  a.remove();
}

export function pOrdersToFrame(gOrders: ProdOrderCombined[]): DataFrame {
  const df = new DataFrame(
    gOrders.map((x) => {
      return {
        소매상품명: x.shopGarment.prodName,
        도매상품명: x.vendorGarment.vendorProdName,
        컬러: x.vendorGarment.color,
        사이즈: x.vendorGarment.size,
        도매처:
          x.vendorGarment.userInfo.displayName ??
          x.vendorGarment.userInfo.userName,
        주문수량: x.orderCnt,
        미송수량: x.pendingCnt,
        도매가: x.vendorGarment.vendorPrice,
        합계: x.orderCnt * x.vendorGarment.vendorPrice,
      };
    })
  );
  return df;
}
