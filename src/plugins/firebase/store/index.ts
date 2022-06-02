import { Firestore, getFirestore } from "@firebase/firestore";
import { getCurrentInstance } from "vue";
import { app } from "../app";

const iostore = getFirestore(app);
const getIoStore = (): Firestore =>
  getCurrentInstance()?.appContext.config.globalProperties.$fire.store ??
  iostore;
export { iostore, getIoStore };
export * from "./common";
export * from "./mapper";
export * from "./user";
export * from "./product";
export * from "./order-info";
