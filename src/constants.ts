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
    successColor: ioColors.primary,
    successColorHover: ioColors.primary,
    successColorPressed: ioColors.primary,
  },
  Button: {
    colorHoverPrimary: ioColors.white,
    textColorPrimary: ioColors.text,
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
