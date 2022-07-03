import { dateToTimeStamp, getIoCollection, loadDate } from "@/plugins/firebase";
import { IoCollection } from "@/types";
import {
  DocumentData,
  DocumentSnapshot,
  setDoc,
  doc,
} from "firebase/firestore";
import { CommonField } from "./common";

export interface IoLogCRT {
  createdAt?: Date;
  uid?: string;
  category?: string;
  txts: string[];
  severity: string;
}

export class IoLog extends CommonField implements IoLogCRT {
  uid?: string;
  category?: string;
  txts: string[];
  severity: string;
  constructor(data: IoLogCRT) {
    super(data.createdAt);
    this.uid = data.uid;
    this.category = data.category;
    this.txts = data.txts.map((x) => {
      try {
        return JSON.parse(x);
      } catch (error) {
        return x;
      }
    });
    this.severity = data.severity;
  }
  async save() {
    if (!this.uid)
      return console.error("user-log save fail: user id is required");
    await setDoc(
      doc(
        getIoCollection({
          c: IoCollection.USER_LOG,
          uid: this.uid,
        }).withConverter(ioLogConverter)
      ),
      this
    );
  }

  static fromJson(data: { [x: string]: any }): IoLog | null {
    return data && data.vendorProdId
      ? new IoLog({
          createdAt: loadDate(data.createdAt ?? null),
          uid: data.uid,
          category: data.category,
          txts: data.txts,
          severity: data.severity,
        })
      : null;
  }
}

export const ioLogConverter = {
  toFirestore: (p: IoLog) => {
    const j = p.toJson();
    j.createdAt = dateToTimeStamp(p.createdAt);
    j.updatedAt = dateToTimeStamp(p.updatedAt);
    return j;
  },
  fromFirestore: (snapshot: DocumentSnapshot<DocumentData>): IoLog | null => {
    const data = snapshot.data();
    if (!data || !data.vendorProdId) return null;
    return IoLog.fromJson(data);
  },
};
