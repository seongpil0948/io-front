import { ProductCrt } from "@/composable";

export abstract class Product implements ProductCrt {
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  info: string;
  description: string;
  constructor(d: ProductCrt) {
    this.createdAt = d.createdAt;
    this.updatedAt = d.updatedAt;
    this.info = d.info;
    this.description = d.description;
  }
}
