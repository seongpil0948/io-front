import { uuidv4 } from "@firebase/util";
import {
  OrderCancel,
  ORDER_GARMENT_DB,
  ORDER_STATE,
  REASON_TYPE,
  useAlarm,
} from "@/composable";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { useLogger } from "vue-logger-plugin";

export function useCancel() {
  const msg = useMessage();
  const logger = useLogger();
  const smtp = useAlarm();

  function getCancel(
    prodOrderId: string,
    fromState: ORDER_STATE,
    reason: string,
    type: REASON_TYPE
  ): OrderCancel {
    const claim: OrderCancel = {
      id: uuidv4(),
      prodOrderId,
      reqDate: new Date(),
      state: fromState,
      reason,
      type,
      approved: false,
      done: false,
    };
    return claim;
  }
  async function cancelSelected(
    shopName: string,
    shopId: string,
    vendorId: string,
    orderDbId: string,
    prodOrderId: string,
    claim: OrderCancel,
    cancelCnt: number
  ) {
    return ORDER_GARMENT_DB.cancelReq(
      shopId,
      orderDbId,
      prodOrderId,
      claim,
      cancelCnt
    )
      .then(async () => {
        await smtp.sendAlarm({
          toUserIds: [vendorId],
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${shopName} 에서 주문을 취소 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
        msg.success("주문취소 완료", makeMsgOpt());
      })
      .catch((err) => {
        const message = `주문취소 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        console.error(err);
        msg.error(message, makeMsgOpt());
        logger.error(shopId, message);
      });
  }

  async function cancelApprove(
    shopIds: string[],
    orderDbIds: string[],
    prodOrderIds: string[],
    vendorName: string,
    vendorId: string
  ) {
    return ORDER_GARMENT_DB.cancelApprove(orderDbIds, prodOrderIds)
      .then(async () => {
        await smtp.sendAlarm({
          toUserIds: shopIds,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${vendorName} 에서 주문취소를 승인 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
        msg.success("주문취소 완료", makeMsgOpt());
      })
      .catch((err) => {
        const message = `주문취소 승인 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        console.error(err);
        msg.error(message, makeMsgOpt());
        logger.error(vendorId, message);
      });
  }
  async function cancelReject(
    shopIds: string[],
    orderDbIds: string[],
    prodOrderIds: string[],
    vendorName: string,
    vendorId: string
  ) {
    return ORDER_GARMENT_DB.cancelReject(orderDbIds, prodOrderIds)
      .then(async () => {
        await smtp.sendAlarm({
          toUserIds: shopIds,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${vendorName} 에서 주문취소를 반려 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
        });
        msg.success("주문취소 반려 완료", makeMsgOpt());
      })
      .catch((err) => {
        const message = `주문취소 반려 실패 ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`;
        console.error(err);
        msg.error(message, makeMsgOpt());
        logger.error(vendorId, message);
      });
  }
  return {
    cancelSelected,
    getCancel,
    cancelApprove,
    cancelReject,
  };
}
