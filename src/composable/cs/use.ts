import { CsPost, POST_TYPE } from "./domain";
import {
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  QueryConstraint,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { csPostFireConverter } from "@/composable";
import { USER_ROLE, getIoCollection } from "@io-boxies/js-lib";
import { KAKAO_CHANNEL_ID } from "@/constants";
import { ComponentInternalInstance } from "vue";
import { ioFireStore } from "@/plugin/firebase";
const getCollection = () =>
  getIoCollection(ioFireStore, { c: "CS_POST" }).withConverter(
    csPostFireConverter
  );

export function postTypeToKo(postType: POST_TYPE) {
  switch (postType) {
    case "EVENT":
      return "이벤트";
    case "FAQ":
      return "자주묻는질문";
    case "NOTICE":
      return "공지사항";
  }
}

export async function getCsFaq(role: USER_ROLE) {
  const snap = await extractSnap([
    where("postType", "==", "FAQ" as POST_TYPE),
    where("allowRole", "==", role),
  ]);
  return extractPost(snap);
}

export async function getCsNotice(role: USER_ROLE) {
  const snap = await extractSnap([
    where("postType", "==", "NOTICE" as POST_TYPE),
    where("allowRole", "==", role),
  ]);
  return extractPost(snap);
}
export async function getCsEvents() {
  const snap = await extractSnap([
    where("postType", "==", "EVENT" as POST_TYPE),
  ]);
  return extractPost(snap);
}

export async function deletePost(postId: string) {
  return await deleteDoc(doc(getCollection(), postId));
}
async function extractSnap(constraints: QueryConstraint[]) {
  return await getDocs(
    query(getCollection(), ...constraints, orderBy("createdAt", "desc"))
  );
}
function extractPost(snap: QuerySnapshot<CsPost | null>) {
  const posts: CsPost[] = [];
  snap.docs.forEach((d) => {
    const data = d.data();
    if (data) {
      posts.push(data);
    }
  });
  return posts;
}

export function csChat(inst: ComponentInternalInstance | null) {
  if (!inst) return;
  console.log("Cs Chat", inst);
  const kakao = inst?.appContext.config.globalProperties.$kakao;
  kakao.Channel.chat({
    channelPublicId: KAKAO_CHANNEL_ID,
  });
}
