import { Timestamp } from "@firebase/firestore";

export function dateToTimeStamp(d: Date | undefined): Timestamp {
  if (!d) {
    d = new Date();
  } else if (!(d instanceof Date)) {
    d = new Date(d);
  }
  return Timestamp.fromDate(d);
}
export function loadDate(d: Date | { [x: string]: number } | string): Date {
  if (!d) return new Date();
  else if (d instanceof Date) return d;
  else if (typeof d === "string") return new Date(d);
  else if (d.seconds) return new Date(d.seconds * 1000);
  else throw Error("Fail to load Date");
}
