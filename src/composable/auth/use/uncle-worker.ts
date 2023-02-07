import { onFirestoreErr, onFirestoreCompletion } from "@/composable/common";
import { useAuthStore } from "@/store";
import { onSnapshot, query, where } from "@firebase/firestore";
import {
  getIoCollection,
  IoCollection,
  IoUser,
  userFireConverter,
  usersFromSnap,
} from "@io-boxies/js-lib";
import { onBeforeUnmount, ref, computed } from "vue";
import { ioFireStore } from "@/plugin/firebase";

export function useUncleWorkers() {
  const auth = useAuthStore();
  const u = auth.currUser();
  const workers = ref<IoUser[]>([]);

  const imageById = computed(() =>
    workers.value.reduce((acc, curr) => {
      acc[curr.userInfo.userId] = curr.userInfo.profileImg ?? "/img/x.png";
      return acc;
    }, {} as { [uid: string]: string })
  );
  const c = getIoCollection(ioFireStore, {
    c: IoCollection.USER,
  }).withConverter(userFireConverter);
  const name = "uncleWorkers snapshot";
  const unsubscribe = onSnapshot(
    query(
      c,
      where("userInfo.role", "==", "UNCLE_WORKER"),
      where("userInfo.managerId", "==", u.userInfo.userId)
    ),
    (snapshot) => {
      workers.value = usersFromSnap(snapshot);
    },
    async (err) => {
      await onFirestoreErr(name, err);
      throw err;
    },
    () => onFirestoreCompletion(name)
  );
  onBeforeUnmount(() => unsubscribe());
  return {
    workers,
    imageById,
  };
}
