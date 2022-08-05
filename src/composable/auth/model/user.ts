import {
  AccountInfo,
  CompanyInfo,
  IoUserCRT,
  IoUserInfo,
  ShopOperInfo,
  USER_PROVIDER,
  USER_ROLE,
  VendorOperInfo,
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

export class IoUser extends CommonField implements IoUserCRT {
  userInfo: IoUserInfo;
  companyInfo?: CompanyInfo;
  operInfo?: ShopOperInfo | VendorOperInfo;
  account?: AccountInfo;
  preferDark = false;

  get name() {
    return this.userInfo.displayName ?? this.userInfo.userName;
  }
  get showId() {
    return this.userInfo.email?.split("@")[0] ?? this.name;
  }

  isMe(other: IoUser) {
    return this.userInfo.userId === other.userInfo.userId;
  }

  constructor(c: IoUserCRT) {
    super(c.userInfo.createdAt, c.userInfo.updatedAt);
    this.userInfo = c.userInfo;
    this.companyInfo = c.companyInfo;
    this.operInfo = c.operInfo;
    this.account = c.account;
    this.preferDark = c.preferDark ?? true;
  }

  async update() {
    const authS = useAuthStore();
    await insertById<IoUser>(
      this,
      getIoCollection({ c: IoCollection.USER }),
      this.userInfo.userId,
      true,
      IoUser.fireConverter()
    );
    await authS.login(this);
  }
  static async getFcmToken() {
    const messaging = getMessaging();
    return await getToken(messaging, {
      vapidKey:
        "BDATZH9Zt9gMTBQqOUpt2VMWb7wX2V8t0PeyO_UVCUf46kNkJ_smqT2nx31StrXKHVD_BRq5Bqhr2wsCCXQhLPw",
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
      fcmTokens: [token],
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
          account: data.account,
          preferDark: data.preferDark ?? false,
        })
      : null;
  }
  static fireConverter(): FirestoreDataConverter<IoUser | null> {
    return {
      toFirestore: (u: IoUser) => {
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
