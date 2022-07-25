import { IoUser, UserDB, USER_ROLE } from "@/module";
import { getIoCollection, IoCollection } from "@/util";
import { getDocs, QuerySnapshot, query, where } from "@firebase/firestore";

export const UserFB: UserDB = {
  getUsersByRole: async function (role: USER_ROLE): Promise<IoUser[]> {
    const c = getIoCollection({ c: IoCollection.USER }).withConverter(
      IoUser.fireConverter()
    );
    const snap = await getDocs(query(c, where("userInfo.role", "==", role)));
    return _usersFromSnap(snap);
  },
  create: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  update: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  delete: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  read: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchCreate: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchUpdate: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchDelete: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
  batchRead: function (arg: any): Promise<void> {
    throw new Error("Function not implemented.");
  },
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
