import { useAuthStore } from "@/store";
import { getIoCollection, IoCollection } from "@/util";
import { getDocs, query, where } from "@firebase/firestore";
import { onBeforeMount, ref, computed } from "vue";
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
  async function getWorkers() {
    const c = getIoCollection({ c: IoCollection.USER }).withConverter(
      IoUser.fireConverter()
    );
    const snapshot = await getDocs(
      query(
        c,
        where("userInfo.role", "==", "UNCLE_WORKER"),
        where("userInfo.managerId", "==", u.userInfo.userId)
      )
    );
    workers.value = _usersFromSnap(snapshot);
  }
  onBeforeMount(async () => {
    await getWorkers();
  });
  return {
    workers,
    imageById,
  };
}
