import { ProductHunt, ShoppingCart, MoneyBillWave, Adversal } from "@vicons/fa";
import { Book as BookIcon } from "@vicons/ionicons5";
import { LocalShippingFilled } from "@vicons/material";
import { People16Regular } from "@vicons/fluent";
import { type Component } from "vue";

export const FAQ_CATEGORIES: {
  [k: string]: {
    showName: string;
    value: string;
    icon: Component;
  }[];
} = {
  SHOP: [
    {
      showName: "주문",
      value: "order",
      icon: ShoppingCart,
    },
    {
      showName: "결제",
      value: "payment",
      icon: MoneyBillWave,
    },
    {
      showName: "상품",
      value: "product",
      icon: ProductHunt,
    },
    {
      showName: "메뉴얼",
      value: "menu",
      icon: BookIcon,
    },
    {
      showName: "인아웃배송",
      value: "io-ship",
      icon: LocalShippingFilled,
    },
  ],
  VENDOR: [
    {
      showName: "주문",
      value: "order",
      icon: ShoppingCart,
    },
    {
      showName: "결제",
      value: "payment",
      icon: MoneyBillWave,
    },
    {
      showName: "상품",
      value: "product",
      icon: ProductHunt,
    },
    {
      showName: "메뉴얼",
      value: "menu",
      icon: BookIcon,
    },
    {
      showName: "인아웃배송",
      value: "io-ship",
      icon: LocalShippingFilled,
    },
  ],
  UNCLE: [
    {
      showName: "픽업",
      value: "order",
      icon: LocalShippingFilled,
    },
    {
      showName: "결제",
      value: "payment",
      icon: MoneyBillWave,
    },
    {
      showName: "근로자 관리",
      value: "product",
      icon: People16Regular,
    },

    {
      showName: "광고설정",
      value: "io-ship",
      icon: Adversal,
    },
    {
      showName: "메뉴얼",
      value: "menu",
      icon: BookIcon,
    },
  ],
};

export const postTypeOpt = [
  {
    label: "FAQ",
    value: "FAQ",
  },
  {
    label: "공지",
    value: "NOTICE",
  },
  {
    label: "이벤트",
    value: "EVENT",
  },
];
