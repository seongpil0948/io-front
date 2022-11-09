import { IoUser, UserDB, USER_PROVIDER, USER_ROLE } from "@/composable";
import { batchInQuery, getIoCollection, IoCollection } from "@/util";
import { UserCredential } from "@firebase/auth";
import {
  getDocs,
  QuerySnapshot,
  query,
  where,
  doc,
  getDoc,
} from "@firebase/firestore";

export const UserFB: UserDB = {
  getUsersByRole: async function (role: USER_ROLE): Promise<IoUser[]> {
    const c = getIoCollection({ c: IoCollection.USER }).withConverter(
      IoUser.fireConverter()
    );
    const snap = await getDocs(query(c, where("userInfo.role", "==", role)));
    return _usersFromSnap(snap);
  },
  getUserById: async function (uid: string) {
    const snapshot = await getDoc(
      doc(getIoCollection({ c: IoCollection.USER }), uid).withConverter(
        IoUser.fireConverter()
      )
    );
    const u = snapshot.data();
    return u;
  },
  getUserByIds: async function (uids: string[]): Promise<IoUser[]> {
    if (uids.length < 1) return [];
    const c = getIoCollection({ c: IoCollection.USER }).withConverter(
      IoUser.fireConverter()
    );
    const snapshots = await batchInQuery<IoUser | null>(
      uids,
      c,
      "userInfo.userId"
    );
    return snapshots.flatMap(_usersFromSnap);
  },
  ioSignUpCredential: async function (
    uc: UserCredential,
    name: string,
    role: USER_ROLE
  ) {
    const user = await IoUser.fromCredential(
      uc,
      name,
      role,
      USER_PROVIDER.KAKAO
    );
    await user.update();
  },
};

export function _usersFromSnap(snap: QuerySnapshot<IoUser | null>): IoUser[] {
  const users: IoUser[] = [];
  console.log("users snap from cache " + snap.metadata.fromCache);
  snap.docs.forEach((d) => {
    const data = d.data();
    if (data) {
      users.push(data);
    }
  });
  return users;
}
