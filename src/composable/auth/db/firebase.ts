import { getIoCollectionGroup, ioFireStore } from "@/plugin/firebase";
import { UserCredential } from "@firebase/auth";
import {
  getDocs,
  QuerySnapshot,
  query,
  where,
  doc,
  getDoc,
  Firestore,
} from "@firebase/firestore";
import {
  getIoCollection,
  IoCollection,
  batchInQuery,
  insertById,
} from "@io-boxies/js-lib";
import { IoUser, UserDB, USER_PROVIDER, USER_ROLE } from "../domain";
import { userFireConverter, userFromCredential } from "../util";

export const UserFB: UserDB = {
  getUsersByRole: async function (
    store: Firestore,
    role: USER_ROLE
  ): Promise<IoUser[]> {
    const c = getIoCollection(store, { c: IoCollection.USER }).withConverter(
      userFireConverter
    );
    const snap = await getDocs(query(c, where("userInfo.role", "==", role)));
    return usersFromSnap(snap);
  },
  getUserById: async function (
    store: Firestore,
    uid: string,
    okVirtual = false
  ) {
    const snapshot = await getDoc(
      doc(getIoCollection(store, { c: IoCollection.USER }), uid).withConverter(
        userFireConverter
      )
    );
    if (snapshot.exists()) {
      const u = snapshot.data();
      return u;
    }
    const querySnapshot = await getDocs(
      query(
        getIoCollection(store, { c: IoCollection.USER }).withConverter(
          userFireConverter
        ),
        where("userInfo.userId", "==", uid)
      )
    );
    for (let i = 0; i < querySnapshot.docs.length; i++) {
      const doc = querySnapshot.docs[i];
      const u = doc.data();
      if (u) return u;
    }
    if (okVirtual) {
      const virtualUserQ = query(
        getIoCollectionGroup(ioFireStore, "VIRTUAL_USER").withConverter(
          userFireConverter
        ),
        where("userInfo.userId", "==", uid)
      );
      const querySnapshot = await getDocs(virtualUserQ);
      if (querySnapshot.empty) return null;
      return querySnapshot.docs[0].data() ?? null;
    }
    return null;
  },
  getUserByIds: async function (
    store: Firestore,
    uids: string[]
  ): Promise<IoUser[]> {
    if (uids.length < 1) return [];
    const c = getIoCollection(store, { c: IoCollection.USER }).withConverter(
      userFireConverter
    );
    const snapshots = await batchInQuery<IoUser | null>(
      uids,
      c,
      "userInfo.userId"
    );
    return snapshots.flatMap(usersFromSnap);
  },
  ioSignUpCredential: async function (
    uc: UserCredential,
    name: string,
    role: USER_ROLE
  ) {
    const user = await userFromCredential(uc, name, role, USER_PROVIDER.KAKAO);
    return user;
  },
  updateUser: async function (store: Firestore, u: IoUser) {
    if (!u.userInfo) throw new Error("userInfo is not exist");
    u.userInfo.updatedAt = new Date();
    await insertById<IoUser>(
      u,
      getIoCollection(store, { c: IoCollection.USER }),
      u.userInfo.userId,
      true,
      userFireConverter
    );
  },
};

export function usersFromSnap(snap: QuerySnapshot<IoUser | null>): IoUser[] {
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
