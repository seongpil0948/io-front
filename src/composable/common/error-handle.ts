import { logger } from "@/plugin/logger";
import router from "@/plugin/router";
import { makeMsgOpt } from "@/util";
import { FirestoreError } from "@firebase/firestore";
import { MessageOptions } from "naive-ui";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";

interface CatchParam {
  err: unknown;
  msg?: MessageApiInjection;
  opt?: MessageOptions;
  uid?: string;
  prefix?: string;
}

export function catchError(p: CatchParam) {
  let message = errToStr(p.err);
  if (p.prefix) {
    message = `${p.prefix} ${message}`;
  }
  expressErr(message, p);
  return message;
}

export function catchExcelError(p: CatchParam) {
  let m = catchError(p);
  if (m.includes("password-protected")) {
    m += " 엑셀파일에 비밀번호가 있습니다. " + m;
  }
  return m;
}

export const errToStr = (err: unknown) =>
  err instanceof Error ? err.message : JSON.stringify(err);

function expressErr(errStr: string, p: Partial<CatchParam>) {
  if (p.msg) {
    p.msg.error(errStr, makeMsgOpt(p.opt));
  }
  logger.error(p.uid, errStr);
}

export async function onFirestoreErr(name: string, err: FirestoreError) {
  // console.log(">>> firestore error >>> ");
  // console.log("code: ", err.code);
  // console.log("cause: ", err.cause);
  // console.log("name: ", err.name);
  // console.log("message: ", err.message);
  // console.log("<<< firestore error <<<");

  if (
    err.code === "permission-denied" &&
    router.currentRoute.value.name !== "Login"
  ) {
    router.replace({ name: "Login" });
  }
  logger.error(null, name + "error", err);
}
export function onFirestoreCompletion(name: string) {
  console.log(`snapshot ${name} completion `);
}
