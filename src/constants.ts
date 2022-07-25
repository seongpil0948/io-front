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
    infoColor: ioColors.primary,
    infoColorHover: ioColors.primary,
    infoColorPressed: ioColors.primary,
    infoColorSuppl: ioColors.primary,
    successColor: ioColors.primary,
    successColorHover: ioColors.primary,
    successColorPressed: ioColors.primary,
    successColorSuppl: ioColors.primary,
    baseColor: ioColors.primary,
    textColorBase: ioColors.text,
    textColor1: ioColors.text,
    textColor2: ioColors.text,
    placeholderColor: ioColors.text,
    iconColor: ioColors.text,
    hoverColor: ioColors.primary,
    bodyColor: ioColors.background,
    fontWeightStrong: "700",
    borderRadius: "10px",
  },
  Input: {
    color: ioColors.primary,
  },
  Layout: {
    color: ioColors.background,
    headerColor: ioColors.white,
    footerColor: ioColors.background,
  },
  Button: {
    color: ioColors.white,
    colorPrimary: ioColors.primary,
    colorHover: ioColors.primary,
    colorHoverPrimary: ioColors.white,
    colorPressed: ioColors.primary,
    colorPressedPrimary: ioColors.white,
    colorTertiary: ioColors.white,
    textColor: ioColors.text,
    textColorGhostPrimary: ioColors.text,
    textColorFocus: ioColors.text,
    textColorTertiary: ioColors.text,
    textColorPrimary: ioColors.text,
    textColorFocusInfo: ioColors.text,
    textColorInfo: ioColors.text,
    textColorSuccess: ioColors.text,
  },
  Radio: {
    dotColorActive: ioColors.primary,
    color: ioColors.white,
    buttonTextColorActive: ioColors.white,
  },
  Checkbox: {
    textColor: ioColors.text,
    color: ioColors.white,
    checkMarkColor: ioColors.text,
    colorChecked: ioColors.white,
  },
  Select: {
    peers: {
      InternalSelectMenu: {
        actionTextColor: ioColors.text,
        optionTextColor: ioColors.text,
        optionTextColorActive: ioColors.text,
      },
      InternalSelection: {
        color: ioColors.primary,

        textColor: ioColors.text,
        textColorDisabled: ioColors.text,
      },
    },
  },
  Carousel: {
    arrowColor: ioColors.primary,
  },
  Tabs: {
    barColor: ioColors.black,
    tabColor: ioColors.primary,
    tabTextColorActiveSegment: ioColors.black,
    tabTextColorActiveBar: ioColors.black,
    tabTextColorActiveCard: ioColors.black,
    tabTextColorSegment: ioColors.black,
    tabTextColorCard: ioColors.black,
    tabTextColorBar: ioColors.black,
    tabTextColorHoverBar: ioColors.white,
    tabTextColorHoverSegment: ioColors.white,
    tabTextColorHoverCard: ioColors.white,
  },
  Dialog: {
    textColor: ioColors.text,
    iconColorSuccess: ioColors.text,
  },
  Popover: {
    dividerColor: ioColors.primary,
  },
  Tooltip: {
    color: ioColors.white,
    textColor: ioColors.black,
    boxShadow: ioColors.primary,
    borderRadius: "10px",
  },
};
