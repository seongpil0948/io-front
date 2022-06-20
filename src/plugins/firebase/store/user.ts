import { userConverter } from "@/composables/model";
import { batchInQuery, getIoCollection } from "@/plugins/firebase";
import { IoUser } from "@/composables";
import { IoCollection, USER_PROVIDER, type USER_ROLE } from "@/types";
import type { UserCredential } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";

async function ioSignUpCredential(
  uc: UserCredential,
  name: string,
  role: USER_ROLE
): Promise<void> {
  const user = await IoUser.fromCredential(uc, name, role, USER_PROVIDER.KAKAO);
  await user.update();
}

async function getUserById(uid: string) {
  const snapshot = await getDoc(
    doc(getIoCollection({ c: IoCollection.USER }), uid).withConverter(
      userConverter
    )
  );
  const u = snapshot.data();
  return u;
}
async function getUserByIds(uids: string[]) {
  if (uids.length < 1) return [];
  const c = getIoCollection({ c: IoCollection.USER }).withConverter(
    userConverter
  );
  const snapshots = await batchInQuery<IoUser | null>(uids, c, "userId");
  return snapshots.flatMap(_usersFromSnap);
}

const getUsersByRole = async (role: USER_ROLE) => {
  const c = getIoCollection({ c: IoCollection.USER }).withConverter(
    userConverter
  );
  const snap = await getDocs(query(c, where("role", "==", role)));
  return _usersFromSnap(snap);
};
function _usersFromSnap(snap: QuerySnapshot<IoUser | null>): IoUser[] {
  const users: IoUser[] = [];

  snap.docs.forEach((d) => {
    const data = d.data();
    if (data) {
      users.push(data);
    }
  });
  return users;
}

export { ioSignUpCredential, getUserById, getUsersByRole, getUserByIds };
