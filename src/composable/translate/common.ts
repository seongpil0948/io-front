export type LOCALE = "ko" | "en" | "cn";

export type Trans = { [l in LOCALE]: { [k: string]: string } };
export type TransType<T extends string> = {
  [l in LOCALE]: { [k in T]: string };
};
