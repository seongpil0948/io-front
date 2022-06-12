import { MessageOptions } from "naive-ui";
import { h } from "vue";

export const makeMsgOpt = (opt?: MessageOptions): MessageOptions =>
  Object.assign(
    {},
    {
      duration: 10000,
      icon: () =>
        h("img", {
          src: "/logo.png",
          width: 25,
          height: 25,
          style: "margin-right: 5px;",
        }),
      closable: true,
    },
    opt
  );
