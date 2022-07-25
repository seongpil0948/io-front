import { mapConverter } from "@/composables";
import { IoCollection } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { getIoCollection } from ".";

async function getMapper(uid: string) {
  const snapshot = await getDoc(
    doc(getIoCollection({ c: IoCollection.MAPPER }), uid).withConverter(
      mapConverter
    )
  );
  return snapshot.data();
}
export { getMapper };
