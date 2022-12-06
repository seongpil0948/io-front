import { commonToJson } from "@io-boxies/js-lib";

export class CommonField {
  createdAt?: Date;
  updatedAt?: Date;
  constructor(createdAt?: Date, updatedAt?: Date) {
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }
  toJson(): { [x: string]: Partial<unknown> } {
    return CommonField.toJson(this);
  }
  static toJson(c: any) {
    return commonToJson(c);
  }
  update(): Promise<void> {
    throw Error("not implement error");
  }
  // public abstract copyWith(d: any): T;
  // public abstract fromJson(d: any): T;
}
