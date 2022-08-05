import {
  DocumentData,
  DocumentSnapshot,
  setDoc,
  doc,
  orderBy,
  startAfter,
  limit,
  collectionGroup,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { logger } from "@/plugin/logger";
import { onBeforeMount, ref } from "vue";
import { CommonField } from "@/composable/common/model";
import { getIoCollection, IoCollection, loadDate } from "@/util";
import { iostore } from "../firebase";
export interface IoLogCRT {
  createdAt?: Date;
  uid?: string;
  category?: string;
  txts: any[];
  severity: string;
}

export class IoLog extends CommonField implements IoLogCRT {
  uid?: string;
  category?: string;
  txts: any[];
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
  toJson(): { [x: string]: Partial<unknown> } {
    for (let i = 0; i < this.txts.length; i++) {
      const txt = this.txts[i];
      if (Array.isArray(txt)) {
        this.txts[i] = JSON.stringify(txt);
      }
    }
    return super.toJson();
  }
  update(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async save() {
    if (!this.uid)
      return logger.error(null, "user-log save fail: user id is required: ");
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
    return data
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
  toFirestore: (u: IoLog) =>
    u instanceof CommonField ? u.toJson() : IoLog.fromJson(u)!.toJson(),
  fromFirestore: (snapshot: DocumentSnapshot<DocumentData>): IoLog | null => {
    const data = snapshot.data();
    if (data) {
      return IoLog.fromJson(data);
    }
    return null;
  },
};

export interface ReadLogParam {
  uids: string[];
  limit: number;
  severity?: string[];
}

export function useReadLogger(param: ReadLogParam) {
  const userLogs = ref<IoLog[]>([]);
  const lastLog = ref<any | null>(null);
  const noMore = ref(false);
  function getQuery() {
    const constraints = [
      where("uid", "in", param.uids),
      orderBy("createdAt", "desc"),
    ];
    if (param.severity) {
      param.severity.forEach((s) => {
        constraints.push(where("severity", "==", s));
      });
    }
    if (lastLog.value) {
      constraints.push(startAfter(lastLog.value));
    }
    constraints.push(limit(param.limit));
    return query(
      collectionGroup(iostore, "logs").withConverter(ioLogConverter),
      ...constraints
    );
  }
  const unsubscribe = onSnapshot(getQuery(), (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        userLogs.value.push(data);
      }
    });
    const len = userLogs.value.length;
    lastLog.value = len > 0 ? userLogs.value[len - 1] : null;
    noMore.value =
      lastLog.value === null ||
      userLogs.value[-1].createdAt === lastLog.value!.createdAt;
  });
  async function next() {
    if (noMore.value) return;
    const len = userLogs.value.length;

    const docs = await getDocs(getQuery());
    docs.forEach((doc) => {
      const data = doc.data();
      if (data) {
        userLogs.value.push(data);
      }
    });
    lastLog.value = len > 0 ? userLogs.value[len - 1] : null;
    noMore.value =
      lastLog.value === null ||
      userLogs.value[-1].createdAt === lastLog.value!.createdAt;
  }
  async function init() {
    lastLog.value = null;
    userLogs.value = [];
    await next();
  }
  onBeforeMount(async () => await init());
  return { userLogs, lastLog, next, noMore, unsubscribe };
}
