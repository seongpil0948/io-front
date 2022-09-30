import {
  CompanyInfo,
  IoUserCRT,
  IoUserInfo,
  ShopInfo,
  ShopOperInfo,
  UncleInfo,
  USER_PROVIDER,
  USER_ROLE,
  VendorOperInfo,
  WorkerInfo,
} from "@/composable";
import { CommonField } from "../../common/model";
import { useAuthStore } from "@/store";
import { insertById, getIoCollection, IoCollection, loadDate } from "@/util";
import { UserCredential } from "@firebase/auth";
import { getMessaging, getToken } from "@firebase/messaging";
import {
  DocumentData,
  DocumentSnapshot,
  FirestoreDataConverter,
} from "firebase/firestore";
import { useRouter } from "vue-router";
import { logger } from "@/plugin/logger";

export const getUserLocate = (u: IoUserCRT) => {
  if (!u.companyInfo || u.companyInfo.locations.length < 1) return null;
  return u.companyInfo.shipLocate ?? u.companyInfo.locations[0];
};
export class IoUser extends CommonField implements IoUserCRT {
  userInfo: IoUserInfo;
  companyInfo?: CompanyInfo;
  operInfo?: ShopOperInfo | VendorOperInfo;
  preferDark = false;
  uncleInfo?: UncleInfo;
  shopInfo?: ShopInfo;
  workerInfo?: WorkerInfo;

  get locate() {
    return getUserLocate(this);
  }
  get name() {
    return this.userInfo.displayName ?? this.userInfo.userName;
  }
  get showId() {
    return this.userInfo.email?.split("@")[0] ?? this.name;
  }
  get availUncleAdvertise() {
    const i = this.uncleInfo;
    return (
      i &&
      i.pickupLocates.length > 0 &&
      i.shipLocates.length > 0 &&
      Object.keys(i.amountBySize).length > 0 &&
      Object.keys(i.amountByWeight).length > 0
    );
  }

  isMe(other: IoUser) {
    return this.userInfo.userId === other.userInfo.userId;
  }

  constructor(c: IoUserCRT) {
    super(c.userInfo.createdAt, c.userInfo.updatedAt);
    this.userInfo = c.userInfo;
    this.companyInfo = c.companyInfo;
    this.operInfo = c.operInfo;
    this.uncleInfo = c.uncleInfo;
    this.preferDark = c.preferDark ?? true;
    this.shopInfo = c.shopInfo;
    this.workerInfo = c.workerInfo;
    if (this.userInfo.role === "UNCLE" && !this.uncleInfo) {
      this.uncleInfo = {
        pickupLocates: [],
        shipLocates: [],
        amountBySize: {},
        amountByWeight: {},
      };
    } else if (this.userInfo.role === "UNCLE_WORKER" && !this.workerInfo) {
      this.workerInfo;
    }
    // else if (this.userInfo.role === "SHOP" && this.shopInfo === undefined) {
    //   this.shopInfo = {
    //     uncleUserIds: [],
    //   };
    // }
  }

  async update(login = true) {
    const authS = useAuthStore();
    await insertById<IoUser>(
      this,
      getIoCollection({ c: IoCollection.USER }),
      this.userInfo.userId,
      true,
      IoUser.fireConverter()
    );
    if (login) await authS.login(this);
  }
  static async getFcmToken() {
    const messaging = getMessaging();
    return getToken(messaging, {
      vapidKey:
        "BDATZH9Zt9gMTBQqOUpt2VMWb7wX2V8t0PeyO_UVCUf46kNkJ_smqT2nx31StrXKHVD_BRq5Bqhr2wsCCXQhLPw",
    })
      .then((currentToken) => {
        if (currentToken) {
          return currentToken;
        } else {
          // Show permission request UI
          console.info(
            null,
            "No registration token available. Request permission to generate one."
          );
          return null; // FIXME: 권한 요청후 실패시 null
        }
      })
      .catch((err) => {
        if (err.code === "messaging/permission-blocked") return null;
        console.error(
          null,
          "An error occurred while retrieving msg token. ",
          err,
          Object.entries(err)
        );
        return null;
      });
  }

  static async fromCredential(
    uc: UserCredential,
    name: string,
    role: USER_ROLE,
    providerId: USER_PROVIDER
  ): Promise<IoUser> {
    // const token = await uc.user.getIdTokenResult();
    const token = await IoUser.getFcmToken();
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
    };
    return new IoUser({ userInfo });
  }
  static fromJson(data: { [x: string]: any }): IoUser | null {
    const userInfo: IoUserInfo = data.userInfo;
    userInfo.createdAt = loadDate(userInfo.createdAt ?? new Date());
    userInfo.updatedAt = loadDate(userInfo.updatedAt ?? new Date());
    return data
      ? new IoUser({
          userInfo,
          companyInfo: data.companyInfo,
          operInfo: data.operInfo,
          preferDark: data.preferDark ?? false,
          uncleInfo: data.uncleInfo,
          workerInfo: data.workerInfo,
          shopInfo: data.shopInfo,
        })
      : null;
  }
  static fireConverter(): FirestoreDataConverter<IoUser | null> {
    return {
      toFirestore: (u: IoUser) => {
        u.updatedAt = new Date();
        return u instanceof CommonField
          ? u.toJson()
          : IoUser.fromJson(u)!.toJson();
      },
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): IoUser | null => {
        const data = snapshot.data(options);
        return data !== undefined ? IoUser.fromJson(data) : null;
      },
    };
  }
  async setWorkerId(userId: string) {
    if (!this.userInfo.workerIds) {
      this.userInfo.workerIds = [userId];
    } else {
      this.userInfo.workerIds.push(userId);
    }
    await this.update();
  }
}

export function getCurrUser(replace = true): IoUser {
  const authStore = useAuthStore();
  const router = useRouter();
  const user = authStore.user;
  if (!user && replace) {
    router.replace({ name: "Login" });
  }
  return user!;
}
