import { OutputData } from "@editorjs/editorjs";
import { USER_ROLE } from "@io-boxies/js-lib";

export interface CsPost {
  createdAt: Date;
  no: string;
  category: string;
  title: string;
  content: OutputData;
  postType: POST_TYPE;
  allowRole: USER_ROLE;
  txt?: string; // for search
}

export type POST_TYPE = "FAQ" | "NOTICE" | "EVENT";
export const POST_TYPE: { [key in POST_TYPE]: string } = Object.freeze({
  FAQ: "FAQ",
  NOTICE: "NOTICE",
  EVENT: "EVENT",
});
