import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { USER_ROLE, loadDate } from "@io-boxies/js-lib";
import { CsPost } from "./domain";
import { commonToJson } from "@io-boxies/js-lib";
import { OutputData } from "@editorjs/editorjs";

export function csFromJson(data: { [x: string]: any }): CsPost | null {
  return {
    createdAt: loadDate(data.createdAt),
    no: data.no,
    category: data.category,
    title: data.title,
    content: data.content,
    postType: data.postType,
    allowRole: data.allowRole as USER_ROLE,
    txt:
      data.title +
      " " +
      (data.content as OutputData).blocks.map((x) => x.data.text ?? ""),
  };
}
export const csPostFireConverter: FirestoreDataConverter<CsPost | null> = {
  toFirestore: (post: CsPost) => {
    return commonToJson(post);
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options: any
  ): CsPost | null => {
    const data = snapshot.data(options);
    return data !== undefined ? csFromJson(data) : null;
  },
};
