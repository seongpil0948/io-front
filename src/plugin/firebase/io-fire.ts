import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { Analytics, getAnalytics } from "firebase/analytics";
import { getCurrentInstance } from "vue";
import { initializeApp } from "@firebase/app";

interface IoFire {
  store: Firestore;
  storage: FirebaseStorage;
  analytics: Analytics;
}

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
export const analytics = getAnalytics(fbApp);
export const iostore = getFirestore(fbApp);
export const getIoStorage = () => getStorage(fbApp);
export const ioStorage = getIoStorage();
export const getIoStore = (): Firestore =>
  getCurrentInstance()?.appContext.config.globalProperties.$fire.store ??
  iostore;

const ioFire: IoFire = {
  store: iostore,
  storage: ioStorage,
  analytics,
};

export { ioFire, IoFire };
