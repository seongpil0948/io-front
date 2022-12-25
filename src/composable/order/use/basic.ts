import { IoOrder, vendorUserProdFromOrders } from "@/composable";
import { IO_COSTS } from "@/constants";
import { makeMsgOpt, uniqueArr } from "@/util";
import { useMessage } from "naive-ui";
import { ref, computed, Ref } from "vue";
import { useLogger } from "vue-logger-plugin";
import { ORDER_GARMENT_DB } from "../db";
import { OrderItemCombined } from "../domain";
import { DataFrame, toExcel } from "danfojs";
import { IoUser, getUserName, locateToStr } from "@io-boxies/js-lib";
import { useAlarm } from "@io-boxies/vue-lib";
import { axiosConfig } from "@/plugin/axios";

export function useOrderBasic(
  user: IoUser,
  ioOrders: Ref<OrderItemCombined[]>,
  orders: Ref<IoOrder[]>,
  checkedKeys: Ref<string[]>
) {
  const log = useLogger();
  const msg = useMessage();

  const smtp = useAlarm();
  const orderTargets = ref<OrderItemCombined[]>([]);
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
          body: `${getUserName(user)} 으로부터 주문 요청이 도착하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
        });
      })
      .catch((err) => {
        if (err.toString && err.toString().includes("out of stock")) {
          msg.error(`주문개수가 재고 수량보다 많습니다.`, makeMsgOpt());
        } else if (
          err.toString &&
          (err.toString() as string).toLowerCase().includes("network")
        ) {
          log.warn(
            user.userInfo.userId,
            "주문실패 네트워크 에러, 유효하지 않은 이메일일 수 있습니다."
          );
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
    const targetProds = ioOrders.value.filter((x) =>
      checkedKeys.value.includes(x[keyField]!)
    );
    const ids = targetProds.map((prod) => prod.id);
    const targets: IoOrder[] = [];
    for (let i = 0; i < ids.length; i++) {
      const orderItemId = ids[i];
      for (let j = 0; j < orders.value.length; j++) {
        const ord = orders.value[j];
        for (let k = 0; k < ord.items.length; k++) {
          const item = ord.items[k];
          if (item.id !== orderItemId) continue;
          if (ord.items.length < 2) {
            if (!targets.map((z) => z.dbId).includes(ord.dbId)) {
              targets.push(ord);
            }
          } else {
            ord.items.splice(k, 1);
            await ORDER_GARMENT_DB.updateOrder(ord);
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
    orderTargets.value = ioOrders.value.filter((x) =>
      checkedKeys.value.includes(x[keyField]!)
    );
    showReqOrderModal.value = true;
  }
  async function orderAll() {
    orderTargets.value = ioOrders.value;
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
    downOrderItems,
  };
}

export async function downOrderItems(
  gOrders: OrderItemCombined[],
  virtualVendors: IoUser[]
) {
  const df = await pOrdersToFrame(gOrders, virtualVendors);
  const date = new Date();
  const fileName = `${date.toLocaleString()}.xlsx`;
  toExcel(df, { fileName });
  const a = document.createElement("a");
  // a.href = url
  a.href = fileName;
  a.download = fileName;
  // a.click();
  a.remove();
}

export async function pOrdersToFrame(
  gOrders: OrderItemCombined[],
  virtualVendors: IoUser[]
): Promise<DataFrame> {
  const vendorProds = await vendorUserProdFromOrders(gOrders, virtualVendors);
  const df = new DataFrame(
    gOrders
      .map((x) => {
        const vendor = vendorProds.find(
          (v) => v.userInfo.userId === x.vendorId
        );
        if (!vendor || !vendor.companyInfo) return null;
        const locate =
          vendor?.companyInfo.shipLocate ?? vendor?.companyInfo?.locations[0];
        if (!locate) return null;
        return {
          소매상품명: x.shopProd.prodName,
          도매상품명: x.vendorProd.vendorProdName,
          컬러: x.vendorProd.color,
          사이즈: x.vendorProd.size,
          도매처:
            x.vendorProd.userInfo.displayName ?? x.vendorProd.userInfo.userName,
          주문수량: x.orderCnt,
          미송수량: x.pendingCnt,
          도매가: x.vendorProd.vendorPrice,
          합계: x.orderCnt * x.vendorProd.vendorPrice,
          "도매처 건물명": locate.alias,
          "도매처 상세주소": locate.detailLocate ?? "",
          "도매처 주소": locateToStr(locate),
          핸드폰번호: locate.phone,
        };
      })
      .filter((z) => z)
  );
  return df;
}
