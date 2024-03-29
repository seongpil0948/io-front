import { onFirestoreCompletion, onFirestoreErr, IoUser } from "@/composable";
import { handleReadSnap, fireConverter } from "@/util";
import { onSnapshot } from "@firebase/firestore";
import { ref, watchEffect, shallowRef } from "vue";
import { ioFireStore, getIoCollection } from "@/plugin/firebase";

export function useVirtualVendor(uid: string) {
  const name = "VirtualVendor snapshot";
  const virVendorConverter = fireConverter<IoUser>();
  const virVendorC = getIoCollection(ioFireStore, {
    uid,
    c: "VIRTUAL_USER",
  }).withConverter(virVendorConverter);

  const virtualVendors = ref<IoUser[]>([]);
  const virtualVendorById = shallowRef<{ [uid: string]: IoUser }>({});

  watchEffect(() => {
    virtualVendors.value.forEach((v) => {
      const uid = v.userInfo.userId;
      if (!virtualVendorById.value[uid]) {
        virtualVendorById.value[uid] = v;
      }
    });
  });

  const unsubscribeVirtual = onSnapshot(
    virVendorC,
    (snap) =>
      handleReadSnap<IoUser>(
        snap,
        virtualVendors.value,
        (x) => x.userInfo.userId
      ),
    async (err) => {
      await onFirestoreErr(name, err);
      throw err;
    },
    () => onFirestoreCompletion(name)
  );

  return {
    virVendorC,
    virVendorConverter,
    virtualVendors,
    unsubscribeVirtual,
    virtualVendorById,
  };
}
