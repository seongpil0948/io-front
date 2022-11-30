import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { IoFireApp } from "@io-boxies/js-lib";

export const ioFire = IoFireApp.getInst(
  import.meta.env.MODE === "production" ? "io-prod" : "io-dev"
);

export async function initIoFirebase() {
  const ioFire = IoFireApp.getInst(
    import.meta.env.MODE === "production" ? "io-prod" : "io-dev"
  );
  const auth = getAuth(ioFire.app);
  await setPersistence(auth, browserSessionPersistence);
}
