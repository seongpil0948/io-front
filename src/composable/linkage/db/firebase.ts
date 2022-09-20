import { getIoCollection, IoCollection } from "@/util";
import { onSnapshot } from "@firebase/firestore";
import { ref } from "vue";
import { ApiToken, LinkageDB } from "..";

const getC = (uid: string) =>
  getIoCollection({ c: IoCollection.TOKENS, uid }).withConverter(
    ApiToken.fireConverter()
  );
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
};
