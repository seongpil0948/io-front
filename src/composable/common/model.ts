import { getCurrDate } from "@io-boxies/js-lib";

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
    const dateKeys: string[] = [];
    Object.entries(c).forEach(([k, v]) => {
      if (Object.prototype.toString.call(v) === "[object Date]") {
        dateKeys.push(k);
      }
    });
    const j = JSON.parse(JSON.stringify(c));
    dateKeys.forEach((dk) => {
      j[dk] = dateToJson(j[dk]);
    });
    return j;
  }
  update(): Promise<void> {
    throw Error("not implement error");
  }
  // public abstract copyWith(d: any): T;
  // public abstract fromJson(d: any): T;
}

function dateToJson(data: string | Date | undefined): string {
  if (!data) return getCurrDate();
  else if (typeof data === "string") {
    return data;
  } else if (data instanceof Date) {
    return data.toJSON();
  } else {
    throw new Error("not Matched condition in dateToJson of commonField  ");
  }
}
