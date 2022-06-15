import type { LocateCRT } from "./common";
import type { IdTokenResult } from "firebase/auth";

type USER_ROLE = "SHOP" | "VENDOR" | "UNCLE" | "ADMIN" | "ANONYMOUSE";
const USER_ROLE: { [key in string]: USER_ROLE } = Object.freeze({
  SHOP: "SHOP",
  VENDOR: "VENDOR",
  UNCLE: "UNCLE",
  ADMIN: "ADMIN",
  ANONYMOUSE: "ANONYMOUSE",
});

type USER_PROVIDER = "EMAIL" | "KAKAO";
const USER_PROVIDER: { [key in string]: USER_PROVIDER } = Object.freeze({
  EMAIL: "EMAIL",
  KAKAO: "KAKAO",
});
interface IoUserCRT {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  providerId: string | null;
  userName: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  profileImg: string | null;
  locations: LocateCRT[];
  role: USER_ROLE;
  fcmTokens: IdTokenResult[];
}

export { type IoUserCRT, USER_ROLE, USER_PROVIDER };
