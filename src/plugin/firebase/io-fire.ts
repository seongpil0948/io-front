import {
  Firestore,
  enableIndexedDbPersistence,
  initializeFirestore,
  enableNetwork,
  disableNetwork,
  // CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { Analytics, getAnalytics } from "firebase/analytics";
import { getCurrentInstance } from "vue";
import { initializeApp } from "@firebase/app";

interface IoFire {
  store: Firestore;
  storage: FirebaseStorage;
  analytics: Analytics;
}
// >>> fire base app >>>
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZZWgDchBhOt_FegFemyofULLHzTLVjA4",
  authDomain: "io-box.firebaseapp.com",
  databaseURL: "https://io-box-default-rtdb.firebaseio.com",
  projectId: "io-box",
  storageBucket: "io-box.appspot.com",
  messagingSenderId: "812477328372",
  appId: "1:812477328372:web:48d71b6a8390480d6827a1",
  measurementId: "G-JYYCY3TTPS",
};
export const fbApp = initializeApp(firebaseConfig);
// <<< fire base app <<<
// >>> analytics >>>
export const analytics = getAnalytics(fbApp);
// <<< analytics <<<
// >>> fire store >>>
export const iostore = initializeFirestore(fbApp, {
  // cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});
// https://firebase.google.com/docs/firestore/manage-data/enable-offline
enableIndexedDbPersistence(iostore).catch((err) => {
  if (err.code == "failed-precondition") {
    console.info(
      "Multiple tabs open, persistence can only be enabled in one tab at a a time"
    );
  } else if (err.code == "unimplemented") {
    console.info(
      "The current browser does not support all of the features required to enable persistence"
    );
  }
});
export const enableStoreNet = async () => enableNetwork(iostore);
export const disableStoreNet = async () => disableNetwork(iostore);
export const getIoStore = (): Firestore =>
  getCurrentInstance()?.appContext.config.globalProperties.$fire.store ??
  iostore;
//  <<< fire store <<<

// >>> storage >>>
export const getIoStorage = () => getStorage(fbApp);
export const ioStorage = getIoStorage();
// <<< storage <<<

const ioFire: IoFire = {
  store: iostore,
  storage: ioStorage,
  analytics,
};

export { ioFire, IoFire };
