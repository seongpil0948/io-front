import { formatDate, loadDate } from "@io-boxies/js-lib";
import { NButton, NPopover, NSpace, NText } from "naive-ui";
import { defineComponent, PropType } from "vue";
import { OrderDateMap, ORDER_STATE } from "../domain";

const T = Object.assign(
  {},
  { createdAt: "생성일", updatedAt: "수정일" },
  ORDER_STATE
);
export const renderOrderDateMap = (m: OrderDateMap) => {
  const keys: (keyof OrderDateMap)[] = [
    "BEFORE_ORDER",
    "BEFORE_APPROVE",
    "BEFORE_PAYMENT",
    "BEFORE_READY",
    "BEFORE_PICKUP_REQ",
    "BEFORE_APPROVE_PICKUP",
    "BEFORE_ASSIGN_PICKUP",
    "BEFORE_PICKUP",
    "ONGOING_PICKUP",
    "PICKUP_COMPLETE",
    "BEFORE_SHIP",
    "SHIPPING",
    "SHIPPING_PENDING",
    "SHIPPING_WAIT",
    "SHIPPING_COMPLETE",
    "RETURN_REQ",
    "RETURN_APPROVED",
    "RETURN_DONE",
    "REFUND",
    "REFUND_DONE",
    "CHANGE",
    "CHANGE_DONE",
    "CANCEL",
    "ORDER_DONE",
  ];
  const rows = keys.reduce((acc, curr) => {
    const date = m[curr];
    if (!date) return acc;
    const state = curr;
    const row = (
      <NSpace vertical justify="space-between" itemStyle={{ width: "100%" }}>
        {{
          default: () => [
            <NText type="default">
              {{
                default: () => (state in T ? T[state as ORDER_STATE] : state),
              }}
            </NText>,
            <NText type="info">
              {{
                default: () => formatDate(loadDate(date), "MIN"),
              }}
            </NText>,
          ],
        }}
      </NSpace>
    );
    acc.push(row);
    return acc;
  }, [] as JSX.Element[]);
  return (
    <NSpace
      vertical
      align="center"
      justify="center"
      style={{
        maxHeight: "50vh",
        overflow: "auto",
      }}
      itemStyle={{ width: "100%" }}
    >
      {{
        default: () => rows,
      }}
    </NSpace>
  );
};

export const PopOrderDate = defineComponent({
  props: {
    od: {
      type: Object as PropType<OrderDateMap>,
      required: true,
    },
  },
  render() {
    const { od } = this;
    if (!od.createdAt) return "-";
    return (
      <NPopover>
        {{
          trigger: () => (
            <NButton>
              {{
                default: () => formatDate(od.createdAt!, "MIN"),
              }}
            </NButton>
          ),
          default: () => renderOrderDateMap(od),
        }}
      </NPopover>
    );
  },
});
