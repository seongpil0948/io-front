import { useAuthStore } from "@/store";
import { IoUser, SHIP_METHOD, USER_DB, USER_PROVIDER } from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";
import { newProdQuantityOpt, saleAvgOpt } from "@/util";

export async function userUpdate(user: IoUser, login = true) {
  const authS = useAuthStore();
  await USER_DB.updateUser(ioFireStore, user);
  authS.setUser(user);

  if (login) authS.login(user);
}

export async function setWorkerId(me: IoUser, userId: string) {
  if (!me.userInfo.workerIds) {
    me.userInfo.workerIds = [userId];
  } else {
    me.userInfo.workerIds.push(userId);
  }
  return USER_DB.updateUser(ioFireStore, me);
}

export const defaultCompanyInfo = () => ({
  companyName: "",
  companyNo: "",
  companyCertificate: [],
  locations: [],
  emailTax: "inoutbox@gmail.com",
  companyPhone: "",
  shopLink: "",
  ceoName: "",
  ceoPhone: "",
  managerName: "",
  managerPhone: "",
});

export const defaultShopOper = () => ({
  saleAverage: saleAvgOpt.value[0].value,
  purchaseMethod: SHIP_METHOD.UNCLE,
});
export const defaultVendorOper = () => ({
  autoOrderApprove: false,
  saleManageType: "",
  taxDeadlineDay: 1,
  expectNumProdMonthly: newProdQuantityOpt.value[0].value,
});

/**
 * EmailAuthProviderID: password
 * PhoneAuthProviderID: phone
 * GoogleAuthProviderID: google.com
 * FacebookAuthProviderID: facebook.com
 * TwitterAuthProviderID: twitter.com
 * GitHubAuthProviderID: github.com
 * AppleAuthProviderID: apple.com
 * YahooAuthProviderID: yahoo.com
 * MicrosoftAuthProviderID: hotmail.com
 */
export function mapUserProvider(str: string): USER_PROVIDER {
  if (USER_PROVIDER[str]) return USER_PROVIDER[str];
  else if (str === "password") return "EMAIL";
  else if (str === "google.com") return "GOOGLE";
  else throw new Error(`mapUserProvider error: ${str}`);
}
