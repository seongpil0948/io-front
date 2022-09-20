import { CommonField } from "@/composable/common/model";
import { loadDate } from "@/util";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { ApiTokenCrt, API_SERVICE_EX } from "..";

export class ApiToken extends CommonField implements ApiTokenCrt {
  dbId: string;
  accessToken: string; // FIXME: will be removed for security
  refreshToken: string; // FIXME: will be removed for security
  clientId: string;
  expireAt: Date;
  refreshExpireAt: Date;
  mallId: string;
  scopes: string[];
  service: API_SERVICE_EX;
  shopNo?: string | undefined;
  userId: string;
  constructor(c: ApiTokenCrt) {
    super(c.createdAt, c.updatedAt);
    this.dbId = c.dbId;
    this.accessToken = c.accessToken;
    this.refreshToken = c.refreshToken;
    this.clientId = c.clientId;
    this.expireAt = c.expireAt;
    this.refreshExpireAt = c.refreshExpireAt;
    this.mallId = c.mallId;
    this.scopes = c.scopes;
    this.service = c.service;
    this.shopNo = c.shopNo;
    this.userId = c.userId;
  }
  static fromJson(data: { [x: string]: any }, dbId: string): ApiToken | null {
    return data
      ? new ApiToken({
          dbId,
          createdAt: loadDate(data.createdAt),
          updatedAt: loadDate(data.updatedAt),
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          clientId: data.clientId,
          expireAt: data.expireAt,
          refreshExpireAt: data.refreshExpireAt,
          mallId: data.mallId,
          scopes: data.scopes,
          service: data.service,
          shopNo: data.shopNo,
          userId: data.userId,
        })
      : null;
  }

  static fireConverter(): FirestoreDataConverter<ApiToken | null> {
    return {
      toFirestore: (u: ApiToken) => {
        u.updatedAt = new Date();
        return u instanceof CommonField
          ? u.toJson()
          : ApiToken.fromJson(u as any, (u as any).dbId)!.toJson();
      },
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): ApiToken | null => {
        const data = snapshot.data(options);
        if (data === undefined) return null;
        return ApiToken.fromJson(data, snapshot.id);
      },
    };
  }
}
