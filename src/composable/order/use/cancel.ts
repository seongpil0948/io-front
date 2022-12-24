import { uuidv4 } from "@firebase/util";
import {
  OrderCancel,
  ORDER_GARMENT_DB,
  ORDER_STATE,
  REASON_TYPE,
} from "@/composable";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { useLogger } from "vue-logger-plugin";
import { axiosConfig } from "@/plugin/axios";
import { useAlarm } from "@io-boxies/vue-lib";

export function useCancel() {
  const msg = useMessage();
  const logger = useLogger();
  const smtp = useAlarm();

  function getCancel(
    orderItemId: string,
    fromState: ORDER_STATE,
    reason: string,
    type: REASON_TYPE
  ): OrderCancel {
    const claim: OrderCancel = {
      id: uuidv4(),
      orderItemId,
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
    orderItemId: string,
    claim: OrderCancel,
    cancelCnt: number
  ) {
    return ORDER_GARMENT_DB.cancelReq(
      shopId,
      orderDbId,
      orderItemId,
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
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
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
    orderItemIds: string[],
    vendorName: string,
    vendorId: string
  ) {
    return ORDER_GARMENT_DB.cancelApprove(orderDbIds, orderItemIds)
      .then(async () => {
        await smtp.sendAlarm({
          toUserIds: shopIds,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${vendorName} 에서 주문취소를 승인 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
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
    orderItemIds: string[],
    vendorName: string,
    vendorId: string
  ) {
    return ORDER_GARMENT_DB.cancelReject(orderDbIds, orderItemIds)
      .then(async () => {
        await smtp.sendAlarm({
          toUserIds: shopIds,
          subject: `inoutbox 주문 처리내역 알림.`,
          body: `${vendorName} 에서 주문취소를 반려 하였습니다. `,
          notiLoadUri: "/",
          uriArgs: {},
          sendMailUri: `${axiosConfig.baseURL}/mail/sendEmail`,
          pushUri: `${axiosConfig.baseURL}/msg/sendPush`,
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
