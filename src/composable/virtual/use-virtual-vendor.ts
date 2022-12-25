import { onFirestoreCompletion, onFirestoreErr } from "@/composable";
import { getIoCollection, IoUser } from "@io-boxies/js-lib";
import { handleReadSnap, fireConverter } from "@/util";
import { onSnapshot } from "@firebase/firestore";
import { onBeforeUnmount, ref } from "vue";

export function useVirtualVendor(uid: string) {
  const name = "VirtualVendor snapshot";
  const virVendorConverter = fireConverter<IoUser>();
  const virVendorC = getIoCollection({
    uid,
    c: "VIRTUAL_USER",
  }).withConverter(virVendorConverter);

  const virtualVendors = ref<IoUser[]>([]);
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
  onBeforeUnmount(() => unsubscribeVirtual());

  return {
    virVendorC,
    virVendorConverter,
    virtualVendors,
    unsubscribeVirtual,
  };
}
