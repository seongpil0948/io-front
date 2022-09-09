import _axios from "@/plugin/axios";

export function useAlarm() {
  async function sendAlarm(p: AlarmParam) {
    return Promise.all([sendMail(p), sendPush(p), sendKakao(p)]);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function sendPush(p: AlarmParam) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function sendKakao(p: AlarmParam) {}
  async function sendMail(p: MailParam) {
    const f = new FormData();
    for (let i = 0; i < p.toUserIds.length; i++) {
      f.append("toUserIds", p.toUserIds[i]);
    }
    f.set("subject", p.subject);
    f.set("body", p.body);
    await _axios.post("/mail/sendEmail", f);
  }

  return { sendAlarm };
}

interface MailParam {
  toUserIds: string[];
  subject: string;
  body: string;
}

interface AlarmParam extends MailParam {
  notiLoadUri: string;
  uriArgs: { [key: string]: any };
}
