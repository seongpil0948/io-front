import { UserCredential } from "@firebase/auth";
import { getMessaging, getToken } from "@firebase/messaging";
import {
  DocumentData,
  DocumentSnapshot,
  FirestoreDataConverter,
} from "@firebase/firestore";
import { useAuthStore } from "@/store";
import {
  commonFromJson,
  commonToJson,
  dateToTimeStamp,
  IoFireApp,
  IoUser,
  IoUserInfo,
  loadDate,
  SHIP_METHOD,
  UncleInfo,
  USER_DB,
  USER_PROVIDER,
  USER_ROLE,
} from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";
import { newProdQuantityOpt, saleAvgOpt } from "@/util";
import { uuidv4 } from "@firebase/util";
import { DEFAULT_PROFILE_IMG } from "@/constants";

export const getUserLocate = (u: IoUser) => {
  if (!u.companyInfo || u.companyInfo.locations.length < 1) return null;
  return u.companyInfo.shipLocate ?? u.companyInfo.locations[0];
};

export function isMe(me: IoUser, other: IoUser) {
  return me.userInfo.userId === other.userInfo.userId;
}

export function inWork(u: IoUser) {
  return u.workState != null && u.workState == "active";
}

export function getUserName(u: IoUser) {
  return u.userInfo.displayName ?? u.userInfo.userName;
}
export function showId(u: IoUser) {
  return u.userInfo.email?.split("@")[0] ?? getUserName(u);
}
export function availUncleAdvertise(u: IoUser) {
  const i = u.uncleInfo;
  return (
    i &&
    i.pickupLocates.length > 0 &&
    i.shipLocates.length > 0 &&
    Object.keys(i.amountBySize).length > 0 &&
    Object.keys(i.amountByWeight).length > 0
  );
}

export async function getFcmToken() {
  const messaging = getMessaging(IoFireApp.getInst().app);
  return getToken(messaging, {
    vapidKey:
      "BDATZH9Zt9gMTBQqOUpt2VMWb7wX2V8t0PeyO_UVCUf46kNkJ_smqT2nx31StrXKHVD_BRq5Bqhr2wsCCXQhLPw",
  })
    .then((token) => {
      return token ? { createdAt: new Date(), token } : null;
    })
    .catch((err) => {
      if (err.code === "messaging/permission-blocked") return null;
      // const msg =
      //   "An error occurred while retrieving msg token. " +
      //   (err instanceof Error ? err.message : JSON.stringify(err));
      return null;
    });
}

export function userFromJson(data: { [x: string]: any }): IoUser | null {
  if (
    data.userInfo &&
    (data.userInfo.role as USER_ROLE) === "UNCLE" &&
    !data.uncleInfo
  ) {
    data.uncleInfo = uncleInfoEmpty();
  }
  data.userInfo.createdAt = loadDate(data.userInfo.createdAt);
  data.userInfo.updatedAt = loadDate(data.userInfo.updatedAt);
  return commonFromJson(data) as IoUser;
}

export const userFireConverter: FirestoreDataConverter<IoUser | null> = {
  toFirestore: (u: IoUser) => {
    const j = commonToJson(u);
    j.userInfo.createdAt = dateToTimeStamp(j.userInfo.createdAt);
    j.userInfo.updatedAt = dateToTimeStamp(j.userInfo.updatedAt);
    return j;
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options: any
  ): IoUser | null => {
    const data = snapshot.data(options);
    return data !== undefined ? userFromJson(data) : null;
  },
};

export async function userFromCredential(
  uc: UserCredential,
  name: string,
  role: USER_ROLE,
  providerId: USER_PROVIDER
): Promise<IoUser> {
  const token = await getFcmToken();
  const userInfo: IoUserInfo = {
    userId: uc.user.uid,
    providerId,
    userName: name,
    displayName: uc.user.displayName ?? undefined,
    email: uc.user.email ?? "",
    emailVerified: uc.user.emailVerified,
    role: role,
    fcmTokens: token !== null ? [token] : [],
    passed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const data: IoUser = { userInfo };
  if (role === "UNCLE") {
    data.uncleInfo = uncleInfoEmpty();
  }
  return data;
}

export const uncleInfoEmpty = (): UncleInfo => ({
  pickupLocates: [],
  shipLocates: [],
  amountBySize: {},
  amountByWeight: {},
});

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

export function getDefaultUser(role: USER_ROLE, name: string): IoUser {
  return {
    userInfo: {
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: uuidv4(),
      providerId: "EMAIL",
      emailVerified: false,
      role,
      displayName: name,
      userName: name,
      fcmTokens: [],
      passed: false,
      profileImg: DEFAULT_PROFILE_IMG,
    },
    companyInfo: {
      locations: [],
      companyName: "",
      companyNo: "",
      companyCertificate: [],
      emailTax: "",
      companyPhone: "",
      shopLink: "",
      ceoName: "",
      ceoPhone: "",
      managerName: "",
      managerPhone: "",
    },
  };
}
