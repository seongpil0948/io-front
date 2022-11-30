import { onFirestoreErr, onFirestoreCompletion } from "@/composable/common";
import { deleteDoc, doc, onSnapshot, setDoc } from "@firebase/firestore";
import { getIoCollection, IoCollection } from "@io-boxies/js-lib";
import { ref } from "vue";
import { ApiToken, ApiTokenCrt, LinkageDB } from "..";

export const LinkageFB: LinkageDB = {
  getTokensByIdListen: function (uid: string) {
    const c = getC(uid);
    const tokens = ref<ApiToken[]>([]);
    const name = "linkageTokens snapshot";
    const unsubscribe = onSnapshot(
      c,
      (snapshot) => {
        tokens.value = [];
        snapshot.forEach((doc) => {
          const token = doc.data();
          if (token) {
            tokens.value.push(token);
          }
        });
      },
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
      () => onFirestoreCompletion(name)
    );
    return { tokens, unsubscribe };
  },
  deleteToken: async function (uid: string, tokenDbId: string): Promise<void> {
    const c = getC(uid);
    return await deleteDoc(doc(c, tokenDbId));
  },
  createToken: async function (token: ApiTokenCrt): Promise<void> {
    const c = getC(token.userId);
    return setDoc(doc(c, token.dbId), token);
  },
};

const getC = (uid: string) =>
  getIoCollection({ c: IoCollection.TOKENS, uid }).withConverter(
    ApiToken.fireConverter()
  );
