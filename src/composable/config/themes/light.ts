import type { GlobalThemeOverrides } from "naive-ui";
// const auth = useAuthStore()
// const useDark = auth.user ? auth.user.preferDark : false
const lightColors = {
  primary: "#f0c755",
  background: "#f2f2f2",
  text: "#404040",
  black: "#404040",
  white: "#FFFFFF",
  red: "#A7171A",
};
export const lightThemeOver: GlobalThemeOverrides = {
  common: {
    primaryColor: lightColors.primary,
    primaryColorHover: lightColors.white,
    primaryColorPressed: lightColors.primary,
    primaryColorSuppl: lightColors.primary,
    baseColor: lightColors.primary,
    iconColor: lightColors.text,
    bodyColor: lightColors.background,
    fontWeightStrong: "700",
    borderRadius: "10px",
    textColorBase: lightColors.text,
    textColor1: lightColors.text,
    textColor2: lightColors.text,
    successColor: lightColors.primary,
    successColorHover: lightColors.primary,
    successColorPressed: lightColors.primary,
  },
  Button: {
    colorHover: lightColors.primary,
    colorPressed: lightColors.primary,
    textColorPrimary: lightColors.text,
    textColorSuccess: lightColors.text,
  },
  Radio: {
    dotColorActive: lightColors.primary,
    color: lightColors.white,
    buttonTextColorActive: lightColors.white,
  },
  Checkbox: {
    textColor: lightColors.text,
    color: lightColors.white,
    checkMarkColor: lightColors.text,
    colorChecked: lightColors.white,
  },
  Dialog: {
    textColor: lightColors.text,
    iconColorSuccess: lightColors.text,
  },
  Popover: {
    dividerColor: lightColors.primary,
  },
  Tooltip: {
    color: lightColors.white,
    textColor: lightColors.black,
    boxShadow: lightColors.primary,
    borderRadius: "10px",
  },
  Card: {
    borderColor: lightColors.primary,
  },
  Tabs: {
    barColor: lightColors.primary,
  },
};
