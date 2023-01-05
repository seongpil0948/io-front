import { IoFireApp } from "@io-boxies/js-lib";
import { connectFirestoreEmulator, getFirestore } from "@firebase/firestore";
import { connectStorageEmulator, getStorage } from "@firebase/storage";
import {
  connectAuthEmulator,
  initializeAuth,
  useDeviceLanguage,
  setPersistence,
  browserSessionPersistence,
} from "@firebase/auth";

const isTest = import.meta.env.VITE_IS_TEST === "true";
export const ioFire = IoFireApp.getInst(
  import.meta.env.MODE === "production" ? "io-prod" : "io-dev"
);
// let bucketUrl: string | undefined;
// if (isTest) {
//   bucketUrl = "gs://demo-io-box-develop.appspot.com";
// }
// export const ioFireStorage = getStorage(ioFire.app, bucketUrl);
export const ioFireStorage = getStorage(ioFire.app);
export const ioFireAuth = initializeAuth(ioFire.app);
setPersistence(ioFireAuth, browserSessionPersistence);
useDeviceLanguage(ioFireAuth);
export const ioFireStore = getFirestore(ioFire.app);

if (isTest) {
  console.log("=== get firebase with emulators >< === ");
  connectFirestoreEmulator(ioFireStore, "127.0.0.1", 8080);
  connectStorageEmulator(ioFireStorage, "127.0.0.1", 9199);
  connectAuthEmulator(ioFireAuth, "http://localhost:9099");
  console.log("ioFireAuth in emulator: ", ioFireAuth);
}
// setPersistence(ioFireAuth, browserSessionPersistence);
