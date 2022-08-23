import type { GlobalThemeOverrides } from "naive-ui";
// const auth = useAuthStore()
// const useDark = auth.user ? auth.user.preferDark : false
const darkColors = {
  primary: "#d8b786",
  background: "#f2f2f2",
  grey: "#404043",
  text: "#d8b786",
  white: "#404040",
  red: "#A7171A",
};
export const darkThemeOver: GlobalThemeOverrides = {
  common: {
    textColor1: darkColors.primary,
    textColor2: darkColors.primary,
    textColor3: darkColors.primary,
    primaryColor: darkColors.primary,
    // hoverColor: darkColors.primary,
    // borderColor: darkColors.primary,
  },
  Switch: {
    railColorActive: darkColors.primary,
  },
  Select: {
    peers: {
      InternalSelection: {
        textColor: darkColors.primary,
      },
    },
  },
};
