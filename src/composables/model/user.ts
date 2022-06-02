import {
  dateToTimeStamp,
  getIoCollection,
  insertById,
  loadDate,
} from "@/plugins/firebase";
import { useAuthStore } from "@/stores";
import { IoCollection, type IoUserCRT, USER_ROLE } from "@/types";
import type { IdTokenResult, UserCredential } from "firebase/auth";
import type {
  DocumentData,
  DocumentSnapshot,
  FirestoreDataConverter,
} from "firebase/firestore";
import { useRouter } from "vue-router";
import { type Locate, CommonField } from ".";

class IoUser extends CommonField implements IoUserCRT {
  userId: string; // VendorID OR ShopID OR UncleID
  providerId: string | null;
  userName: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  profileImg: string | null;
  locations: Locate[];
  role: USER_ROLE;
  fcmTokens: IdTokenResult[];

  get name() {
    return this.displayName ?? this.userName;
  }
  get showId() {
    return this.email?.split("@")[0] ?? this.name;
  }

  isMe(other: IoUser) {
    return this.userId === other.userId;
  }

  constructor(c: IoUserCRT) {
    super(c.createdAt, c.updatedAt);
    this.userId = c.userId;
    this.displayName = c.displayName;
    this.providerId = c.providerId;
    this.userName = c.userName;
    this.email = c.email;
    this.emailVerified = c.emailVerified;
    this.profileImg = c.profileImg;
    this.locations = c.locations;
    this.role = c.role;
    this.fcmTokens = c.fcmTokens;
  }
  async update() {
    await insertById<IoUser>(
      this,
      getIoCollection({ c: IoCollection.USER }),
      this.userId,
      true,
      userConverter
    );
  }

  static async fromCredential(
    uc: UserCredential,
    name: string,
    role: USER_ROLE
  ): Promise<IoUser> {
    const token = await uc.user.getIdTokenResult();
    return new IoUser({
      userId: uc.user.uid,
      providerId: uc.providerId,
      userName: name,
      displayName: uc.user.displayName,
      email: uc.user.email,
      emailVerified: uc.user.emailVerified,
      profileImg: null,
      locations: [],
      role: role,
      fcmTokens: [token],
    });
  }
  static fromJson(data: { [x: string]: any }): IoUser | null {
    return data && data.userId
      ? new IoUser({
          createdAt: loadDate(data.createdAt ?? null),
          updatedAt: loadDate(data.updatedAt ?? null),
          userId: data.userId,
          providerId: data.providerId ?? null,
          userName: data.userName ?? null,
          displayName: data.displayName ?? null,
          email: data.email ?? null,
          emailVerified: data.emailVerified ?? null,
          profileImg: data.profileImg ?? null,
          locations: data.locations ?? [],
          role: data.role ?? null,
          fcmTokens: data.fcmTokens ?? null,
        })
      : null;
  }
}

const userConverter: FirestoreDataConverter<IoUser | null> = {
  toFirestore: (u: IoUser) => {
    const j = u.toJson();
    j.createdAt = dateToTimeStamp(u.createdAt);
    j.updatedAt = dateToTimeStamp(u.updatedAt);
    return j;
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options: any
  ): IoUser | null => {
    const data = snapshot.data(options);
    return data && data.userId ? IoUser.fromJson(data) : null;
  },
};
function getCurrUser(replace = true): IoUser {
  const authStore = useAuthStore();
  const router = useRouter();
  const user = authStore.user;
  if (!user && replace) {
    router.replace({ name: "Login" });
  }
  return user!;
}

export { IoUser, USER_ROLE, userConverter, getCurrUser };
