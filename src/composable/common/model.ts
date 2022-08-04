import moment from "moment";

export class CommonField {
  createdAt?: Date;
  updatedAt?: Date;
  constructor(createdAt?: Date, updatedAt?: Date) {
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }
  toJson(): { [x: string]: unknown } {
    const c = dateToJson(this.createdAt);
    const u = dateToJson(this.updatedAt);
    const j = JSON.parse(JSON.stringify(this));
    j.createdAt = c;
    j.updatedAt = u;
    return j;
  }
  update(): Promise<void> {
    throw Error("not implement error");
  }
  // public abstract copyWith(d: any): T;
  // public abstract fromJson(d: any): T;
}

function dateToJson(data: string | Date | undefined): string {
  if (!data) return moment(new Date()).format();
  else if (typeof data === "string") {
    return data;
  } else if (data instanceof Date) {
    return data.toJSON();
  } else {
    throw new Error("not Matched condition in dateToJson of commonField  ");
  }
}
