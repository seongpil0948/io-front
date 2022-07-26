import type { GlobalThemeOverrides } from "naive-ui";

export const ioColors = {
  primary: "#f0c755",
  background: "#f2f2f2",
  text: "#404040",
  black: "#404040",
  white: "#FFFFFF",
  red: "#A7171A",
};

// amount * COIN_PAY_RATIO ->  num of coin
export const COIN_PAY_RATIO = 100;
export const COIN_FEE = 0.05;
export const KAKAO_CHANNEL_ID = "_lwnyb";

export const lightTheme: GlobalThemeOverrides = {
  common: {
    primaryColor: ioColors.primary,
    primaryColorHover: ioColors.white,
    primaryColorPressed: ioColors.primary,
    primaryColorSuppl: ioColors.primary,
    baseColor: ioColors.primary,
    iconColor: ioColors.text,
    bodyColor: ioColors.background,
    fontWeightStrong: "700",
    borderRadius: "10px",
    textColorBase: ioColors.text,
    textColor1: ioColors.text,
    textColor2: ioColors.text,
  },
  Radio: {
    dotColorActive: ioColors.primary,
    color: ioColors.white,
    buttonTextColorActive: ioColors.white,
  },
  // Tabs: {
  //   barColor: ioColors.black,
  //   tabColor: ioColors.primary,
  //   tabTextColorActiveSegment: ioColors.black,
  //   tabTextColorActiveBar: ioColors.black,
  //   tabTextColorActiveCard: ioColors.black,
  //   tabTextColorSegment: ioColors.black,
  //   tabTextColorCard: ioColors.black,
  //   tabTextColorBar: ioColors.black,
  //   tabTextColorHoverBar: ioColors.white,
  //   tabTextColorHoverSegment: ioColors.white,
  //   tabTextColorHoverCard: ioColors.white,
  // },
};
