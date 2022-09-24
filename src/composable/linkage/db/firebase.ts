import { getIoCollection, IoCollection } from "@/util";
import { deleteDoc, doc, onSnapshot } from "@firebase/firestore";
import { ref } from "vue";
import { ApiToken, LinkageDB } from "..";

export const LinkageFB: LinkageDB = {
  getTokensByIdListen: function (uid: string) {
    const c = getC(uid);
    const tokens = ref<ApiToken[]>([]);
    const unsubscribe = onSnapshot(c, (snapshot) => {
      tokens.value = [];
      snapshot.forEach((doc) => {
        const token = doc.data();
        if (token) {
          tokens.value.push(token);
        }
      });
    });
    return { tokens, unsubscribe };
  },
  deleteToken: async function (uid: string, tokenDbId: string): Promise<void> {
    const c = getC(uid);
    return await deleteDoc(doc(c, tokenDbId));
  },
};

const getC = (uid: string) =>
  getIoCollection({ c: IoCollection.TOKENS, uid }).withConverter(
    ApiToken.fireConverter()
  );
