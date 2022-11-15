import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "@firebase/auth";

export async function initIoFirebase() {
  const auth = getAuth();
  await setPersistence(auth, browserSessionPersistence);
}
