import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { ioStorage } from "./storage";
import { iostore } from "./store";
import { analytics } from "./app";
import type { Analytics } from "firebase/analytics";

interface IoFire {
  store: Firestore;
  storage: FirebaseStorage;
  analytics: Analytics;
}

const ioFire: IoFire = {
  store: iostore,
  storage: ioStorage,
  analytics,
};

export { ioFire };
