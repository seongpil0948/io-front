export class CommonField {
  createdAt?: Date;
  updatedAt?: Date;
  constructor(createdAt?: Date, updatedAt?: Date) {
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }
  toJson(): { [x: string]: unknown } {
    const c = this.createdAt?.toJSON();
    const u = this.updatedAt?.toJSON();
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
