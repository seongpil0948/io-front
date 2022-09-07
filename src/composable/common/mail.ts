import _axios from "@/plugin/axios";

interface MailParam {
  toUserIds: string[];
  subject: string;
  body: string;
}

export function useSmtp() {
  async function sendMail(p: MailParam) {
    const f = new FormData();
    for (let i = 0; i < p.toUserIds.length; i++) {
      f.append("toUserIds", p.toUserIds[i]);
    }
    f.set("subject", p.subject);
    f.set("body", p.body);
    await _axios.post("/mail/sendEmail", f);
  }

  return {
    sendMail,
  };
}
