import { logger } from "@/plugin/logger";
import { makeMsgOpt } from "@/util";
import { MessageOptions } from "naive-ui";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";

interface CatchParam {
  err: unknown;
  msg?: MessageApiInjection;
  opt?: MessageOptions;
  userId?: string;
}

export function catchError(p: CatchParam) {
  const message = errToStr(p.err);
  expressErr(message, p);
  return message;
}

export function catchExcelError(p: CatchParam) {
  let m = errToStr(p.err);
  if (m.includes("password-protected")) {
    m = "엑셀파일에 비밀번호가 있습니다. " + m;
  }
  catchError(p);
}

export const errToStr = (err: unknown) =>
  err instanceof Error ? err.message : JSON.stringify(err);

function expressErr(errStr: string, p: Partial<CatchParam>) {
  if (p.msg) {
    p.msg.error(errStr, makeMsgOpt(p.opt));
  }
  logger.error(p.userId, errStr);
}
