import { IoUser, GarmentOrder, useUserPay } from "@/composable";
import { IO_COSTS } from "@/constants";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { ref, computed, Ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { ORDER_GARMENT_DB } from "../db";
import { ProdOrderCombined } from "../domain";

export function useOrderBasic(
  user: IoUser,
  garmentOrders: Ref<ProdOrderCombined[]>,
  orders: Ref<GarmentOrder[]>,
  checkedKeys: Ref<string[]>
) {
  const log = useLogger();
  const msg = useMessage();
  const orderTargets = ref<ProdOrderCombined[]>([]);
  const expectedReduceCoin = computed(
    () => IO_COSTS.REQ_ORDER * orderTargets.value.length
  );
  const showReqOrderModal = ref(false);
  const { userPay } = useUserPay();
  const keyField = "id";

  function updateReqOrderShow(val: boolean) {
    if (!val) orderTargets.value = [];
    showReqOrderModal.value = val;
  }
  async function onReqOrderConfirm() {
    const ids = orderTargets.value.map((x) => x.id);

    return Promise.all(
      orders.value
        .filter((y) => y.items.some((item) => ids.includes(item.id)))
        .map((t) => ORDER_GARMENT_DB.orderGarment(t, expectedReduceCoin.value))
    )
      .then(() => msg.success("주문 성공.", makeMsgOpt()))
      .catch((err) => {
        if (typeof err.toString && err.toString().includes("out of stock")) {
          msg.error(`주문개수가 재고 수량보다 많습니다.`, makeMsgOpt());
        } else {
          console.log("error", err);
          msg.error(`주문 실패. ${err}`, makeMsgOpt());
          log.error(user.userInfo.userId, `주문 실패. ${err}`);
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
      .catch(() => msg.success("삭제 실패.", makeMsgOpt()));
  }
  async function deleteAll() {
    return ORDER_GARMENT_DB.batchDelete(orders.value)
      .then(() => msg.success("삭제 성공.", makeMsgOpt()))
      .catch(() => msg.success("삭제 실패.", makeMsgOpt()));
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
    userPay,
    keyField,
    updateReqOrderShow,
    onReqOrderConfirm,
    deleteChecked,
  };
}
