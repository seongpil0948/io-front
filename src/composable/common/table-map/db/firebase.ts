import { getDoc, doc } from "@firebase/firestore";
import { getIoCollection, IoCollection } from "@io-boxies/js-lib";
import { MapperDB } from "../domain";
import { Mapper } from "../model";

export const MapperFB: MapperDB = {
  getMapper: async function (uid: string) {
    const snapshot = await getDoc(
      doc(getIoCollection({ c: IoCollection.MAPPER }), uid).withConverter(
        Mapper.fireConverter()
      )
    );
    return snapshot.data();
  },
};
