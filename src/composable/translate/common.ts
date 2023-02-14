export type LOCALE = "ko" | "en" | "cn";

export type Trans = { [l in LOCALE]: { [k: string]: string } };
export type TransType<T extends string> = {
  [l in LOCALE]: { [k in T]: string };
};

export const parseLocale = (code: string): LOCALE => {
  console.info(`lang code in parseLocale: ${code}`);
  code = code.toLowerCase();
  if (code.includes("en")) return "en";
  else if (code.includes("ko")) return "ko";
  else if (code.includes("zh")) return "cn";
  else return "ko";
};
