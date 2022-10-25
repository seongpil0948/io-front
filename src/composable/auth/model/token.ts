import { CommonField } from "@/composable";

export class FcmToken {
  createdAt: Date;
  token: string;
  constructor(c: { createdAt: Date; token: string }) {
    this.createdAt = c.createdAt;
    this.token = c.token;
  }
  static fromJson(data: { [x: string]: any }): FcmToken | null {
    return data
      ? new FcmToken({
          createdAt: data.createdAt,
          token: data.token,
        })
      : null;
  }
  toJson(): { [x: string]: Partial<unknown> } {
    return CommonField.toJson(this);
  }
}
