import { useAuthStore } from "@/store";
import { getIoCollection, IoCollection } from "@/util";
import { onSnapshot, query, where } from "@firebase/firestore";
import { onBeforeUnmount, ref, computed } from "vue";
import { _usersFromSnap } from "../db/firebase";
import { IoUser } from "../model";

export function useUncleWorkers() {
  const auth = useAuthStore();
  const u = auth.currUser;
  const workers = ref<IoUser[]>([]);

  const imageById = computed(() =>
    workers.value.reduce((acc, curr) => {
      acc[curr.userInfo.userId] = curr.userInfo.profileImg ?? "/img/x.png";
      return acc;
    }, {} as { [uid: string]: string })
  );
  const c = getIoCollection({ c: IoCollection.USER }).withConverter(
    IoUser.fireConverter()
  );
  const unsubscribe = onSnapshot(
    query(
      c,
      where("userInfo.role", "==", "UNCLE_WORKER"),
      where("userInfo.managerId", "==", u.userInfo.userId)
    ),
    (snapshot) => {
      workers.value = _usersFromSnap(snapshot);
    }
  );
  onBeforeUnmount(() => unsubscribe());
  return {
    workers,
    imageById,
  };
}
