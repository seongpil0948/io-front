import { CommonField } from "@/composable/common/model";
import { loadDate } from "@io-boxies/js-lib";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { ApiTokenCrt, API_SERVICE_EX } from "..";
import { commonToJson } from "@io-boxies/js-lib";

export class ApiToken extends CommonField implements ApiTokenCrt {
  dbId: string;
  clientId?: string;
  expireAt?: Date;
  refreshExpireAt?: Date;
  mallId?: string;
  scopes?: string[];
  service: API_SERVICE_EX;
  shopNo?: string;
  userId: string;
  alias: string;
  accessKey?: string;
  secretKey?: string;
  constructor(c: ApiTokenCrt) {
    super(c.createdAt, c.updatedAt);
    this.dbId = c.dbId;
    this.clientId = c.clientId;
    this.expireAt = c.expireAt;
    this.refreshExpireAt = c.refreshExpireAt;
    this.mallId = c.mallId;
    this.scopes = c.scopes;
    this.service = c.service;
    this.shopNo = c.shopNo;
    this.userId = c.userId;
    this.alias = c.alias;
    this.accessKey = c.accessKey;
    this.secretKey = c.secretKey;
  }
  static fromJson(data: { [x: string]: any }, dbId: string): ApiToken | null {
    return data
      ? new ApiToken({
          dbId,
          createdAt: data.createdAt ? loadDate(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? loadDate(data.updatedAt) : undefined,
          expireAt: data.expireAt ? loadDate(data.expireAt) : undefined,
          refreshExpireAt: data.refreshExpireAt
            ? loadDate(data.refreshExpireAt)
            : undefined,
          clientId: data.clientId,
          mallId: data.mallId,
          scopes: data.scopes,
          service: data.service,
          shopNo: data.shopNo,
          userId: data.userId,
          alias: data.alias ?? "",
          accessKey: data.accessKey,
        })
      : null;
  }

  static fireConverter(): FirestoreDataConverter<ApiToken | null> {
    return {
      toFirestore: (u: ApiToken) => commonToJson(u),
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
